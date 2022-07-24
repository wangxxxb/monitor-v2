let lastEvent: Event;
['click', 'mousedown', 'mouseover', 'touchstart', 'keydown'].forEach((eventType) => {
    document.addEventListener(
        eventType,
        function (event) {
            lastEvent = event;
        },
        {
            passive: true, // 被动模式
            capture: true, // 捕获阶段执行
        }
    );
});

export default function () {
    return lastEvent;
}
