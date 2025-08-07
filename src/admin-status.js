// Получаем ссылки на нужные элементы
const changeStatusBtn = document.getElementById('change-status-participant');

// Добавим модальное окно для изменения статуса в разметку (желательно рядом с админ-панелью)
// Если хотите, можно добавить настоящий HTML в документ заранее, здесь пример создания динамически:

const statusModalHTML = `
<div id="status-modal" class="modal hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;
    background: rgba(0,0,0,0.5); display:flex;align-items:center;justify-content:center; z-index:3000;">
    <div style="background:#fff; padding:20px; border-radius:8px; width:320px; box-sizing:border-box; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        <h3>Изменить статус участника</h3>
        <select id="participant-status-select" style="width: 100%; padding: 8px; font-size: 1rem; margin-top:12px;">
            <option value="online">Онлайн</option>
            <option value="recently">Был недавно</option>
            <option value="custom">Был в сети (тогда и тогда)</option>
        </select>
        <input type="datetime-local" id="custom-status-datetime" class="hidden" style="margin-top: 12px; width: 100%; padding: 6px;" />
        <div style="margin-top: 20px; text-align: right;">
            <button id="status-save-btn" class="primary-btn" style="margin-right:10px;">Сохранить</button>
            <button id="status-cancel-btn" class="secondary-btn">Отмена</button>
        </div>
    </div>
</div>
`;

// Добавляем модалку в body (один раз)
document.body.insertAdjacentHTML('beforeend', statusModalHTML);

const statusModal = document.getElementById('status-modal');
const statusSelect = document.getElementById('participant-status-select');
const customDatetimeInput = document.getElementById('custom-status-datetime');
const statusSaveBtn = document.getElementById('status-save-btn');
const statusCancelBtn = document.getElementById('status-cancel-btn');

// Чтобы отслеживать, для какого участника меняют статус, храните id
let editingParticipantId = null;

// При смене статуса показываем/скрываем поле для даты (для custom)
statusSelect.addEventListener('change', () => {
    if (statusSelect.value === 'custom') {
        customDatetimeInput.classList.remove('hidden');
    } else {
        customDatetimeInput.classList.add('hidden');
        customDatetimeInput.value = ''; // очищаем
    }
});

// Функция открытия модалки редактирования статуса
function openStatusModal(participantId) {
    editingParticipantId = participantId;
    const participant = getParticipantById(participantId);
    if (!participant) return;

    // Устанавливаем текущее значение в селекте
    if (participant.status === 'online') {
        statusSelect.value = 'online';
        customDatetimeInput.classList.add('hidden');
        customDatetimeInput.value = '';
    } else if (participant.status === 'был недавно') {
        statusSelect.value = 'recently';
        customDatetimeInput.classList.add('hidden');
        customDatetimeInput.value = '';
    } else {
        // Пару попыток распарсить "был в сети 2023-08-05T14:30:00" (пример)
        const customMatch = participant.status.match(/был в сети\s*(.*)/i);
        if (customMatch) {
            statusSelect.value = 'custom';
            customDatetimeInput.classList.remove('hidden');
            const dateStr = customMatch[1];
            // Установим значение для datetime если valid
            if (Date.parse(dateStr)) {
                // Приводим к формату для datetime-local: yyyy-MM-ddThh:mm
                const dt = new Date(dateStr);
                customDatetimeInput.value = dt.toISOString().slice(0,16);
            } else {
                customDatetimeInput.value = '';
            }
        } else {
            // Неизвестный формат — ставим recently по умолчанию
            statusSelect.value = 'recently';
            customDatetimeInput.classList.add('hidden');
            customDatetimeInput.value = '';
        }
    }

    statusModal.classList.remove('hidden');
}

// Закрыть модалку
function closeStatusModal() {
    statusModal.classList.add('hidden');
    editingParticipantId = null;
}

// Сохранить статус
statusSaveBtn.addEventListener('click', () => {
    if (!editingParticipantId) return;

    const participant = getParticipantById(editingParticipantId);
    if (!participant) return;

    let newStatus = '';
    if (statusSelect.value === 'online') {
        newStatus = 'online';
    } else if (statusSelect.value === 'recently') {
        newStatus = 'был недавно';
    } else if (statusSelect.value === 'custom') {
        if (customDatetimeInput.value) {
            newStatus = `был в сети ${customDatetimeInput.value}`;
        } else {
            alert('Пожалуйста, укажите дату и время для статуса "Был в сети".');
            return;
        }
    }

    participant.status = newStatus;

    saveData();
    populateAdminPanel(); // обновим статусы в админке

    // Также обновим статус в основном интерфейсе, если меняется статус другого участника
    updateChatHeader();

    closeStatusModal();
});

// Отмена
statusCancelBtn.addEventListener('click', closeStatusModal);

// Обработчик кнопки "Изменить статус участника"
changeStatusBtn.addEventListener('click', () => {
    const chat = getCurrentChat();
    if (!chat || !chat.participants.length) {
        alert('Нет участников для изменения статуса.');
        return;
    }

    // Предложим выбрать участника — если нужно изменить статус для конкретного, можно сделать сначала диалог выбора.
    // Сейчас возьмём первого, кроме текущего пользователя:
    const participant = chat.participants.find(p => !p.isCurrentUser);
    if (!participant) {
        alert('Статус текущего пользователя менять нельзя.');
        return;
    }

    openStatusModal(participant.id);
});
