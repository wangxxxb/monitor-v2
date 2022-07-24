import { logger, LogLevel, get } from '@monitor/shared'

export default function (context) {
    let connection = navigator.connection;
    const machineEnv = {
        type: 'machine-info',
        effectiveType: get(connection, 'effectiveType'), //网络环境
        rtt: get(connection, 'rtt'), //往返时间
        screen: `${window.screen.width}x${window.screen.height}`, //设备分辨率
    }
    logger(LogLevel.DEFAULT, 'connection:', machineEnv)
    context.track(machineEnv);
}
