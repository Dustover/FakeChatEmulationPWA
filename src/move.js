function enableParticipantDragAndDrop() {
    let participantsContainer = document.getElementById('participants');
    let dragSrcEl = null;

    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        this.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault(); // обязательно для дропа
        this.classList.add('over');
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter() {
        // можно добавить эффект, если нужно
    }

    function handleDragLeave() {
        this.classList.remove('over');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!dragSrcEl || dragSrcEl === this) return false;

        // Получаем массив участников
        const nodes = Array.from(participantsContainer.querySelectorAll('.participant'));
        const srcIndex = nodes.indexOf(dragSrcEl);
        const targetIndex = nodes.indexOf(this);

        if (srcIndex < 0 || targetIndex < 0) return false;

        const chat = getCurrentChat();
        if (!chat) return false;

        // Перемещаем участника в массиве
        const movedParticipant = chat.participants.splice(srcIndex, 1)[0];
        chat.participants.splice(targetIndex, 0, movedParticipant);

        // Сохраняем и обновляем интерфейс
        saveData();
        populateAdminPanel();

        // ❗ После перерисовки DOM нужно заново назначить обработчики!
        setTimeout(() => {
            participantsContainer = document.getElementById('participants'); // на случай, если id пересоздан
            initDragAndDrop();
            updateChatHeader();
        }, 0);

        return false;
    }

    function handleDragEnd() {
        const participants = participantsContainer.querySelectorAll('.participant');
        participants.forEach(p => {
            p.classList.remove('over', 'dragging');
        });
    }

    function addDnDHandlers(elem) {
        elem.setAttribute('draggable', 'true');
        elem.addEventListener('dragstart', handleDragStart, false);
        elem.addEventListener('dragenter', handleDragEnter, false);
        elem.addEventListener('dragover', handleDragOver, false);
        elem.addEventListener('dragleave', handleDragLeave, false);
        elem.addEventListener('drop', handleDrop, false);
        elem.addEventListener('dragend', handleDragEnd, false);
    }

    function initDragAndDrop() {
        const participants = participantsContainer.querySelectorAll('.participant');
        participants.forEach(addDnDHandlers);
    }

    return { initDragAndDrop };
}