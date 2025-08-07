// Получаем ссылки на нужные элементы
const changeStatusBtn = document.getElementById('change-status-participant');

// Добавим модальное окно для изменения статуса в разметку (один раз)
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
document.body.insertAdjacentHTML('beforeend', statusModalHTML);

// Получаем элементы управления модалкой
const statusModal = document.getElementById('status-modal');
const statusSelect = document.getElementById('participant-status-select');
const customDatetimeInput = document.getElementById('custom-status-datetime');
const statusSaveBtn = document.getElementById('status-save-btn');
const statusCancelBtn = document.getElementById('status-cancel-btn');

// Переменная для хранения ID редактируемого участника
let editingParticipantId = null;

// Показ/скрытие поля даты в зависимости от выбора статуса
statusSelect.addEventListener('change', () => {
    if (statusSelect.value === 'custom') {
        customDatetimeInput.classList.remove('hidden');
    } else {
        customDatetimeInput.classList.add('hidden');
        customDatetimeInput.value = ''; // очистка
    }
});

// Функция для правильного склонения слова "день"
function pluralizeDays(number) {
    number = Math.abs(number) % 100;
    const n1 = number % 10;
    if (number > 10 && number < 20) return 'дней';
    if (n1 > 1 && n1 < 5) return 'дня';
    if (n1 === 1) return 'день';
    return 'дней';
}

// Функция открытия модального окна с заполнением статусом участника
function openStatusModal(participantId) {
    editingParticipantId = participantId;
    const participant = getParticipantById(participantId);
    if (!participant) return;

    if (participant.status === 'online') {
        statusSelect.value = 'online';
        customDatetimeInput.classList.add('hidden');
        customDatetimeInput.value = '';
    } else if (participant.status === 'был недавно') {
        statusSelect.value = 'recently';
        customDatetimeInput.classList.add('hidden');
        customDatetimeInput.value = '';
    } else {
        // Проверка формата "был в сети N дней назад"
        let daysMatch = participant.status.match(/был в сети (\d+) дней? назад/i);
        if (daysMatch) {
            const daysAgo = parseInt(daysMatch[1], 10);
            const dt = new Date();
            dt.setDate(dt.getDate() - daysAgo);
            const day = dt.getDate().toString().padStart(2, '0');
            const month = (dt.getMonth() + 1).toString().padStart(2, '0');
            const year = dt.getFullYear();
            const hours = dt.getHours().toString().padStart(2, '0');
            const minutes = dt.getMinutes().toString().padStart(2, '0');
            const isoDatetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
            customDatetimeInput.value = isoDatetimeLocal;
            statusSelect.value = 'custom';
            customDatetimeInput.classList.remove('hidden');
            statusModal.classList.remove('hidden');
            return;
        }

        // Разбор формата "был(-а) в сети ДД.ММ.ГГГГ в ЧЧ:ММ"
        const regex = /был(?:\(-а\))? в сети (\d{2})\.(\d{2})\.(\d{4}) в (\d{2}):(\d{2})/i;
        const match = participant.status.match(regex);
        if (match) {
            const [, day, month, year, hours, minutes] = match;
            const isoDatetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
            customDatetimeInput.value = isoDatetimeLocal;
            statusSelect.value = 'custom';
            customDatetimeInput.classList.remove('hidden');
        } else {
            statusSelect.value = 'recently';
            customDatetimeInput.classList.add('hidden');
            customDatetimeInput.value = '';
        }
    }

    statusModal.classList.remove('hidden');
}

// Функция закрытия модалки
function closeStatusModal() {
    statusModal.classList.add('hidden');
    editingParticipantId = null;
}

// Обработчик сохранения статуса
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
        if (!customDatetimeInput.value) {
            alert('Пожалуйста, укажите дату и время для статуса "Был в сети".');
            return;
        }
        const dt = new Date(customDatetimeInput.value);
        if (isNaN(dt)) {
            alert('Некорректная дата.');
            return;
        }

        const now = new Date();
        const diffMs = now - dt;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 10) {
            newStatus = `был в сети ${diffDays} ${pluralizeDays(diffDays)} назад`;
        } else {
            const day = dt.getDate().toString().padStart(2, '0');
            const month = (dt.getMonth() + 1).toString().padStart(2, '0');
            const year = dt.getFullYear();
            const hours = dt.getHours().toString().padStart(2, '0');
            const minutes = dt.getMinutes().toString().padStart(2, '0');
            newStatus = `был(-а) в сети ${day}.${month}.${year} в ${hours}:${minutes}`;
        }
    }

    participant.status = newStatus;

    saveData();
    populateAdminPanel();
    updateChatHeader();
    closeStatusModal();
});

// Отмена (закрытие без сохранения)
statusCancelBtn.addEventListener('click', closeStatusModal);

// Обработчик кнопки открытия модалки для изменения статуса
changeStatusBtn.addEventListener('click', () => {
    const chat = getCurrentChat();
    if (!chat || !chat.participants.length) {
        alert('Нет участников для изменения статуса.');
        return;
    }

    const participant = chat.participants.find(p => !p.isCurrentUser);
    if (!participant) {
        alert('Статус текущего пользователя менять нельзя.');
        return;
    }

    openStatusModal(participant.id);
});


// Помогают получить текущий чат и участника — эти функции должны быть в вашем коде
function getCurrentChat() {
    return state.chats.find(chat => chat.id === state.currentChatId);
}

function getParticipantById(id) {
    const chat = getCurrentChat();
    if (!chat) return null;
    return chat.participants.find(p => p.id === id);
}

// Здесь предополагается, что функции saveData, populateAdminPanel и updateChatHeader реализованы в вашем коде,
// они обновляют данные в локальном хранилище, отображение админ-панели и интерфейс

