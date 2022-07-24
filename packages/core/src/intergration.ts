import { MonitorContext } from './context'

export interface Intergration {
    (context: MonitorContext): void
}
