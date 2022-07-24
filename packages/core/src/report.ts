import { debounce } from '@monitor/shared'

class Report {
    constructor(public dig: (logList: any[]) => void, public debounceTime: number = 1000) {
        this.send = debounce(this._send, this.debounceTime)
    }

    public send: ReturnType<typeof debounce>

    /**
     * 待发送日志列表
     */
    public logList: any[] = []

    /**
     * 载荷最大容量
     */
    public maxPayloadCount: number = 10

    /**
     * 添加一条日志
     */
    public report = (data) => {
        this.logList.push(data)
        if (this.logList.length >= this.maxPayloadCount) {
            this.send.stop()
            this._send()
        } else {
            this.send()
        }
    }

    /**
     * 发送日志
     */
    public _send = () => {
        this.dig(this.logList)
        this.logList.length = 0
    }
}

export default Report
