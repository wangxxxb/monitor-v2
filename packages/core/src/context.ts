import { LogLevel } from '@monitor/shared'

export interface MonitorContext {
    sdkVersion: string
    track: (log: string) => void
    ready: boolean
    debugLevel: LogLevel
}

const context: MonitorContext = {
    sdkVersion: __VERSION__,
    track: undefined,
    ready: false,
    debugLevel: LogLevel.DEFAULT,
}

export default context