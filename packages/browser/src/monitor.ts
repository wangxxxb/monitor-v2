import { Core, MonitorOptions } from '@monitor/core'

class Monitor extends Core {
    public constructor(props: MonitorOptions) {
        super(props)
    }

    public dig = (data) => {
        console.log(data)
    }
}

export default Monitor
