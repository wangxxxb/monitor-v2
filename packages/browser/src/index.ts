import { MonitorOptions } from '@monitor/core'
import Monitor from './monitor'
export * from './intergrations'

export function init(options: MonitorOptions) {
    return new Monitor(options)
}
