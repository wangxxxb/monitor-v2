import { getLastEvent, getSelector } from '../utils/index';
import { logger, LogLevel, get } from '@monitor/shared'

export default function (context) {
    if (!context.isSupportPerformanceObserver && !window.requestIdleCallback) return;

    new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.duration > 100) {
                let lastEvent = getLastEvent();
                requestIdleCallback(() => {
                    const log = {
                        eventType: lastEvent ? lastEvent.type : '',
                        startTime: entry.startTime,
                        duration: entry.duration,
                        selector: lastEvent ? getSelector(get(lastEvent, 'path', get(lastEvent, 'target'))) : '',
                    };
                    logger(LogLevel.WARN, '发送长时间任务指标，埋点内容 => ', log);
                    context.track(log);
                });
            }
        });
    }).observe({ entryTypes: ['longtask'] });
}
