import merge from 'merge'
import { get, logger, isFunction, LogLevel } from '@monitor/shared'
import context, { MonitorContext } from './context'
import { defaultOptions, MonitorOptions } from './options'
import { Intergration } from './intergration'
import Report from './report'

class Core {
    constructor(options: MonitorOptions) {
        this.initOptions(options)
        this.context.track = this.track
        this.reportInstance = new Report(this._dig, 1000)
        this.context.ready = true
        logger(LogLevel.DEFAULT, 'start monitor...');
    }

    private monitorOptions: Partial<MonitorOptions> = defaultOptions

    private context: MonitorContext = context

    private intergrations: Intergration[] = []

    private reportInstance: Report

    private initOptions = (options: Partial<MonitorOptions>) => {
        if (!this.validateOptions(options)) return
        this.monitorOptions = merge({}, this.monitorOptions, options)
        this.context.debugLevel = this.monitorOptions.logLevel!
        this.intergrations = Array.from(new Set([...(this.monitorOptions.intergrations || [])]))
        this.monitorOptions.intergrations = this.intergrations

        logger(LogLevel.DEFAULT, '配置更新完毕');
        logger(LogLevel.DEFAULT, '当前为环境为 ' + this.monitorOptions.env);
        logger(LogLevel.DEFAULT, '更新后配置为:', this.monitorOptions);
    }

    private validateOptions = (options: Partial<MonitorOptions>) => {
        const errorConfigs: string[] = [];

        const getPageType = get(options, ['getPageType'])
        if (typeof getPageType !== 'undefined' && isFunction(getPageType) === false) {
            logger(LogLevel.DEFAULT, '警告: 配置项：getPageType 不是可执行函数, 将使用默认函数!');
            options.getPageType = undefined
        }

        const logLevel = get(options, ['logLevel'])
        if (typeof logLevel !== 'undefined' && (typeof logLevel !== 'number' || (logLevel > LogLevel.WARN || logLevel < LogLevel.DEFAULT))) {
            logger(LogLevel.DEFAULT, '警告: 配置项：logLevel 设置错误!');
            options.logLevel = undefined
        }

        const intergrations = get(options, ['intergrations'])
        if (typeof intergrations !== 'undefined') {
            if (!Array.isArray(intergrations)) {
                logger(LogLevel.WARN, '警告: 配置项：intergrations 需要传入一个数组!');
                options.intergrations = []
            } else {
                options.intergrations = intergrations.filter((item) => typeof item === 'function')
            }
        }

        if (errorConfigs.length > 0) {
            logger(LogLevel.ERROR, `配置项错误\n${errorConfigs.join('\n')}`);
            return false
        } else {
            return true
        }
    }

    private track = (data: any) => {
        this.reportInstance.report(data)
    }

    public dig?: (data: string) => void

    private _dig = (data: any[]) => {
        if (typeof this.monitorOptions.beforeSend === 'function') {
            data = data.filter((item) => this.monitorOptions.beforeSend!(item))
        }
        // 如果外层集成实现了dig，那么就调用外部的dig方法
        if (typeof this.dig === 'function') {
            return this.dig(JSON.stringify(data))
        }
        logger(LogLevel.ERROR, `需实现dig方法`);
    }

    public run = () => {
        this.intergrations.forEach(func => func.call(this, this.context))
        return this
    }
}

export {
    MonitorOptions,
    Core,
}
