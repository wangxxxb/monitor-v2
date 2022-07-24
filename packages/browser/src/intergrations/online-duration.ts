import { logger, LogLevel } from '@monitor/shared'

export default function (context) {
    // 用户在线时长统计
    const OFFLINE_MILL = 15 * 60 * 1000; // 15分钟不操作认为不在线
    const SEND_MILL = 5 * 1000; // 每5s打点一次

    let lastTime = Date.now();

    window.addEventListener(
        'click',
        () => {
            const now = Date.now();
            const duration = now - lastTime;
            if (duration > OFFLINE_MILL) {
                lastTime = Date.now();
            } else if (duration > SEND_MILL) {
                lastTime = Date.now();
                const log = {
                    type: 'online-duration',
                    duration,
                };
                logger(LogLevel.DEFAULT, '用户留存时间埋点:', log);
                // 用户在线时长
                context.track(log);
            }
        },
        false
    );
}
