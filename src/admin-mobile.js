const adminToggle = document.getElementById('admin-toggle');

function handleAdminToggle(event) {
    event.preventDefault();
    openAdminPanel();
}

adminToggle.addEventListener('click', handleAdminToggle);
adminToggle.addEventListener('touchend', handleAdminToggle);

function enableDragForAdminPanel() {
    const panel = document.getElementById('admin-panel');
    const header = document.getElementById('admin-panel-header'); // Предполагается, что у шапки есть этот id

    if (!panel || !header) return;

    let pos = { top: 0, left: 0, x: 0, y: 0 };
    let isDragging = false;

    // Начало перетаскивания (мышь)
    const mouseDownHandler = function(e) {
        isDragging = true;

        pos = {
            left: panel.offsetLeft,
            top: panel.offsetTop,
            x: e.clientX,
            y: e.clientY
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);

        e.preventDefault();
    };

    // Перемещение мыши
    const mouseMoveHandler = function(e) {
        if (!isDragging) return;

        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;

        panel.style.left = `${pos.left + dx}px`;
        panel.style.top = `${pos.top + dy}px`;
    };

    // Конец перетаскивания
    const mouseUpHandler = function() {
        isDragging = false;

        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    // Начало перетаскивания (касание)
    const touchStartHandler = function(e) {
        if (e.touches.length !== 1) return;  // только один палец

        isDragging = true;

        const touch = e.touches[0];
        pos = {
            left: panel.offsetLeft,
            top: panel.offsetTop,
            x: touch.clientX,
            y: touch.clientY
        };

        document.addEventListener('touchmove', touchMoveHandler);
        document.addEventListener('touchend', touchEndHandler);
        document.addEventListener('touchcancel', touchEndHandler);

        e.preventDefault();
    };

    // Перемещение пальца по экрану
    const touchMoveHandler = function(e) {
        if (!isDragging) return;
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        const dx = touch.clientX - pos.x;
        const dy = touch.clientY - pos.y;

        panel.style.left = `${pos.left + dx}px`;
        panel.style.top = `${pos.top + dy}px`;
    };

    // Завершение касания
    const touchEndHandler = function() {
        isDragging = false;

        document.removeEventListener('touchmove', touchMoveHandler);
        document.removeEventListener('touchend', touchEndHandler);
        document.removeEventListener('touchcancel', touchEndHandler);
    };

    header.style.cursor = 'move';
    header.addEventListener('mousedown', mouseDownHandler);
    header.addEventListener('touchstart', touchStartHandler);
}

