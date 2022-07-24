import { LogLevel } from '@monitor/shared'
import { Intergration } from './intergration'

export interface MonitorOptions {
    /**
     * 上报环境
     */
    env: string
    beforeSend?: (data) => boolean;
    /**
     * 上报版本号
     */
    version: string
    /**
     * 获取页面的基本信息
     */
    getPageType: (hostLocation: any) => any
    /**
     * 自定义dig函数
     */
    dig?: (log: string) => void
    logLevel?: LogLevel
    intergrations?: Intergration[]
}

export const defaultOptions: Partial<MonitorOptions> = {
    // 默认生产环境
    env: 'prod',
    getPageType: (location) => {
        if(typeof window !== 'undefined') {
            const {host, pathname} = location as Location
            return host + pathname
        }
    },
    version: '1.0.0',
    logLevel: LogLevel.DEFAULT,
    intergrations: [],
}
