import { logger, LogLevel, get } from '@monitor/shared'
import { getLastEvent, getSelector } from '../utils/index'

export default function (context) {
    window.addEventListener(
        'error',
        function (event) {
            const lastEvent = getLastEvent()
            let log
            if (event.target && (get(event, 'target.src') || get(event, 'target.href'))) {
                log = {
                    type: 'error',
                    errorType: 'resouceError', //JS执行错误
                    filename: get(event, 'target.src', get(event, 'target.href')),
                    tagName: get(event, 'target.tagName').toLowerCase(), //SCRIPT
                    selector: getSelector(event.target),
                }
            } else {
                log = {
                    type: 'error',
                    errorType: 'jsError', //JS执行错误
                    message: event.message, //报错信息
                    filename: event.filename,
                    position: `${event.lineno}:${event.colno}`,
                    stack: getLines(event.error.stack),
                    selector: lastEvent ? getSelector(get(lastEvent, 'path')) : '',
                }
            }

            logger(LogLevel.ERROR, '发送错误指标埋点, 埋点内容 => ', log)
            context.track(log)
        },
        true
    )
    window.addEventListener(
        'unhandledrejection',
        function (event) {
            let lastEvent = getLastEvent()
            let message,
                filename,
                lineno = 0,
                colno = 0,
                stack = '',
                reason = event.reason
            if (typeof reason === 'string') {
                message = reason
            } else if (typeof reason === 'object') {
                if (reason.stack) {
                    let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/)
                    message = reason.message
                    filename = matchResult[1]
                    lineno = matchResult[2]
                    colno = matchResult[3]
                }
                stack = getLines(reason.stack)
            }

            const log = {
                type: 'error',
                errorType: 'promiseError', //JS执行错误
                message, //报错信息
                filename,
                position: `${lineno}:${colno}`,
                stack,
                selector: lastEvent ? getSelector(get(lastEvent, 'path')) : '',
            }

            logger(LogLevel.ERROR, '发送错误指标埋点, 埋点内容 => ', log)
            context.track(log)
        },
        true
    )

    function getLines(stack) {
        return stack
            .split('\n')
            .slice(1)
            .map((item) => item.replace(/^\s+at\s+/g, ''))
            .join('^')
    }
}
