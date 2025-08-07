// Конфигурация приложения
const CONFIG = {
    currentUserId: 2, // ID текущего пользователя (Борис)
    storageKey: 'fakeChatData',
    themes: ['telegram', 'whatsapp', 'imessage']
};

// Состояние приложения
const state = {
    currentChatId: 1,
    chats: [
        {
            id: 1,
            name: "Основной чат",
            participants: [
                { id: 1, name: "Анна", status: "online", avatar: null },
                { id: 2, name: "Борис", status: "был 5 мин назад", avatar: null, isCurrentUser: true }
            ],
            messages: [
                { id: 1, senderId: 1, text: "Привет! Готовы к съёмкам?", timestamp: new Date(Date.now() - 30 * 60000).toISOString(), status: "read" },
                { id: 2, senderId: 2, text: "Да, уже на месте! Где реквизит?", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), status: "read" },
                { id: 3, senderId: 1, text: "В гримёрке, второй стол. Можете взять что нужно 😊", timestamp: new Date(Date.now() - 20 * 60000).toISOString(), status: "read" }
            ],
            appearance: {
                theme: "telegram",
                showTimestamps: true,
                showStatus: true
            }
        },
        {
            id: 2,
            name: "Анна и Борис",
            participants: [
                { id: 1, name: "Анна", status: "online", avatar: null },
                { id: 2, name: "Борис", status: "был 5 мин назад", avatar: null, isCurrentUser: true }
            ],
            messages: [
                { id: 1, senderId: 1, text: "Где встретимся?", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), status: "read" }
            ],
            appearance: {
                theme: "telegram",
                showTimestamps: true,
                showStatus: true
            }
        }
    ],
    isAdminPanelOpen: false,
    activeAdminTab: "participants",
    typingUser: null
};

// Получение текущего чата
function getCurrentChat() {
    return state.chats.find(chat => chat.id === state.currentChatId);
}

// Получение участника по ID
function getParticipantById(participantId) {
    const chat = getCurrentChat();
    return chat.participants.find(p => p.id === participantId);
}

// Форматирование времени
function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Форматирование даты
function formatDate(isoString) {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Сегодня";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Вчера";
    } else {
        return date.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'});
    }
}

// Группировка сообщений по датам
function groupMessagesByDate(messages) {
    const grouped = {};

    messages.forEach(message => {
        const date = new Date(message.timestamp).toDateString();

        if (!grouped[date]) {
            grouped[date] = [];
        }

        grouped[date].push(message);
    });

    return grouped;
}

// Закрытие админ-панели
function closeAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    adminPanel.classList.remove('visible');
    setTimeout(() => {
        adminPanel.classList.add('hidden');
        state.isAdminPanelOpen = false;
    }, 300);
}

// Открытие админ-панели
function openAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    adminPanel.classList.remove('hidden');
    setTimeout(() => {
        adminPanel.classList.add('visible');
        state.isAdminPanelOpen = true;
    }, 10);
    populateAdminPanel();
}

// Переключение вкладок админ-панели
function switchAdminTab(tabId) {
    state.activeAdminTab = tabId;

    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Показать активную вкладку
    document.getElementById(`${tabId}-tab`).classList.remove('hidden');

    // Обновить активную кнопку
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
}

// Загрузка данных из localStorage с восстановлением isCurrentUser
function loadData() {
    try {
        const savedData = localStorage.getItem(CONFIG.storageKey);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            state.chats = parsedData.chats || state.chats;
            state.currentChatId = parsedData.currentChatId || state.currentChatId;

            const chat = state.chats.find(chat => chat.id === state.currentChatId);
            if (chat) {
                chat.participants.forEach(p => {
                    p.isCurrentUser = (p.id === CONFIG.currentUserId);
                });
            }
        }
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
    }
}

// Сохранение данных
function saveData() {
    try {
        const dataToSave = {
            chats: state.chats,
            currentChatId: state.currentChatId
        };
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(dataToSave));
    } catch (e) {
        console.error('Ошибка сохранения данных:', e);
    }
}

// Отрисовка списка чатов
function renderChatList() {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';

    state.chats.forEach(chat => {
        const lastMessage = chat.messages.length > 0
            ? chat.messages[chat.messages.length - 1].text
            : 'Нет сообщений';

        const isActive = chat.id === state.currentChatId;

        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${isActive ? 'active' : ''}`;
        chatItem.dataset.chatId = chat.id;
chatItem.innerHTML = `
    <div class="avatar-placeholder"></div>
    <div class="chat-info">
        <div class="chat-name">${chat.name}</div>
        <div class="last-message">${lastMessage}</div>
    </div>
`;



        chatItem.addEventListener('click', () => switchChat(chat.id));
        chatList.appendChild(chatItem);
    });
}

// Переключение чата
function switchChat(chatId) {
    state.currentChatId = chatId;
    saveData();
    renderChatList();
    renderMessages();
    updateChatHeader();
}

// Обновление шапки чата
function updateChatHeader() {
    const chat = getCurrentChat();
    document.getElementById('chat-name').textContent = chat.name;

    // Обновление статуса (показываем статус первого участника кроме текущего)
    const otherParticipant = chat.participants.find(p => !p.isCurrentUser);
    if (otherParticipant) {
        document.getElementById('chat-status').textContent = otherParticipant.status;
    }
}

// Отрисовка сообщений
// Рендер сообщений
function renderMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';

    const chat = getCurrentChat();
    const groupedMessages = groupMessagesByDate(chat.messages);

    const showTimestamps = chat.appearance.showTimestamps;
    if (!showTimestamps) {
        messagesContainer.classList.add('no-timestamps');
    } else {
        messagesContainer.classList.remove('no-timestamps');
    }

    Object.keys(groupedMessages).forEach(date => {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'message-date';
        dateHeader.textContent = formatDate(groupedMessages[date][0].timestamp);
        messagesContainer.appendChild(dateHeader);

        groupedMessages[date].forEach(message => {
            const sender = getParticipantById(message.senderId);
            const isCurrentUser = sender.isCurrentUser;

            const messageEl = document.createElement('div');
            messageEl.className = `message ${isCurrentUser ? 'outgoing' : 'incoming'}`;
            messageEl.dataset.messageId = message.id;

            messageEl.innerHTML = `
                <div class="bubble">${escapeHtml(message.text)}</div>
                <div class="meta">
                    <span class="time">${formatTime(message.timestamp)}</span>
                    <span class="status">${isCurrentUser ? '✓✓' : ''}</span>
                </div>
            `;

            // Навешиваем универсальные обработчики без условий — на все сообщения
            messageEl.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                openEditMessage(message.id);
            });

            let lastTap = 0;
            messageEl.addEventListener('touchend', (event) => {
                const currentTime = Date.now();
                const tapLength = currentTime - lastTap;
                if (tapLength > 0 && tapLength < 300) {
                    event.preventDefault();
                    openEditMessage(message.id);
                }
                lastTap = currentTime;
            });

            messagesContainer.appendChild(messageEl);
        });
    });

    scrollToBottom();
}



// Открытие редактирования сообщения по ID
function openEditMessage(messageId) {
    const chat = getCurrentChat();
    const message = chat.messages.find(m => m.id === messageId);
    if (!message) return;

    const messagesContainer = document.getElementById('messages');
    const messageEl = messagesContainer.querySelector(`.message[data-message-id="${messageId}"]`);
    if (!messageEl) return;

    const bubble = messageEl.querySelector('.bubble');
    if (!bubble) return;

    // Если редактор уже открыт — не открываем заново
    if (bubble.querySelector('textarea')) return;

    const originalText = message.text;

    bubble.innerHTML = `
        <textarea class="edit-textarea" rows="3">${escapeHtml(originalText)}</textarea>
        <div class="edit-controls" style="margin-top: 4px;">
            <button class="save-edit-btn" title="Сохранить">💾</button>
            <button class="cancel-edit-btn" title="Отмена">❌</button>
        </div>
    `;

    const textarea = bubble.querySelector('textarea');
    textarea.focus();
    textarea.setSelectionRange(originalText.length, originalText.length);

    const cancelEdit = () => {
        bubble.textContent = originalText;
    };

    const saveEdit = () => {
    const newText = textarea.value.trim();
    if (newText === '') {
        alert('Текст сообщения не может быть пустым');
        return;
    }

    // Найти сообщение по id (предполагается, что есть переменная currentEditingMessageId)
    const chat = getCurrentChat();
    const messageIndex = chat.messages.findIndex(msg => msg.id === currentEditingMessageId);

    if (messageIndex !== -1) {
        chat.messages[messageIndex].text = newText;
        saveData();
        renderMessages(); // Функция рендеринга сообщений, замените своей
        closeEditModal(); // Закрываем окно редактирования, если есть
    } else {
        console.warn('Сообщение для редактирования не найдено');
    }
};

// Простая экранизация HTML для безопасности и стабильности разметки
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return m;
        }
    });
}







// Отправка сообщения из основного интерфейса
function sendMessageFromUI() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();

    if (!text) return;

    addMessage(CONFIG.currentUserId, text);
    input.value = '';
    input.focus();
}

// Отправка сообщения из админ-панели
function addMessage(senderId, text) {
    const chat = getCurrentChat();
    if (!chat) {
        console.error('Текущий чат не найден');
        return;
    }

    const newMessage = {
        id: Date.now(),
        senderId,
        text,
        timestamp: new Date().toISOString(),
        status: "sent"
    };

    chat.messages.push(newMessage);
    saveData();
    renderMessages();

    const otherParticipant = chat.participants.find(p => p.id !== senderId);
    if (otherParticipant) {
        showTypingIndicator(otherParticipant.name);
        setTimeout(hideTypingIndicator, 2000);
    }
}

function addMessageWithCustomTime(senderId, text, timestamp) {
    const chat = getCurrentChat();
    if (!chat) {
        console.error('Текущий чат не найден');
        return;
    }

    const newMessage = {
        id: Date.now(),
        senderId,
        text,
        timestamp,
        status: "sent"
    };

    chat.messages.push(newMessage);
    saveData();
    renderMessages();

    const otherParticipant = chat.participants.find(p => p.id !== senderId);
    if (otherParticipant) {
        showTypingIndicator(otherParticipant.name);
        setTimeout(hideTypingIndicator, 2000);
    }
}


function sendMessageFromAdmin() {
    const senderSelect = document.getElementById('msg-sender');
    const textInput = document.getElementById('msg-text');
    const timeSelect = document.getElementById('msg-time');
    const customTimeInput = document.getElementById('custom-time');

    if (!senderSelect || !textInput) {
        console.error('Элементы отправки сообщения из админ-панели не найдены');
        return;
    }

    const senderId = parseInt(senderSelect.value, 10);
    const text = textInput.value.trim();

    if (isNaN(senderId)) {
        alert('Выберите отправителя');
        return;
    }

    if (!text) {
        alert('Введите текст сообщения');
        return;
    }

    // Новая часть: вычисляем timestamp
    const selectedTime = timeSelect.value;
    const customTimeValue = customTimeInput && !customTimeInput.classList.contains('hidden')
    ? customTimeInput.value
    : null;
    const timestamp = getMessageTimestamp(selectedTime, customTimeValue);

    // Вместо addMessage(senderId, text);
    addMessageWithCustomTime(senderId, text, timestamp);

    textInput.value = '';
}



// Добавление участника
function addParticipant() {
    const name = prompt('Имя нового участника:', 'Участник');
    if (!name) return;

    const chat = getCurrentChat();
    const newId = Math.max(...chat.participants.map(p => p.id), 0) + 1;

    chat.participants.push({
        id: newId,
        name,
        status: "online",
        avatar: null
    });

    saveData();
    populateAdminPanel();
}

// Заполнение админ-панели
function populateAdminPanel() {
    const chat = getCurrentChat();

    // Участники
    const participantsContainer = document.getElementById('participants');
    participantsContainer.innerHTML = '';

    chat.participants.forEach(participant => {
        const participantEl = document.createElement('div');
        participantEl.className = 'participant';

        participantEl.innerHTML = `
            <div class="avatar-placeholder"></div>
            <div class="participant-info">
                <span class="name">${participant.name}</span>
                <span class="status">${participant.status}</span>
            </div>
            <button class="edit-btn">✏️</button>
        `;

        participantsContainer.appendChild(participantEl);
    });

    // Отправители сообщений
    const senderSelect = document.getElementById('msg-sender');
    senderSelect.innerHTML = '';

    chat.participants.forEach(participant => {
        const option = document.createElement('option');
        option.value = participant.id;
        option.textContent = participant.name;
        senderSelect.appendChild(option);
    });

    // Название чата
    document.getElementById('chat-name-input').value = chat.name;

    // Тема оформления
    document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
        const selectedTheme = option.dataset.theme;

        // Меняем тему приложения сразу
        changeTheme(selectedTheme);

        // Обновляем визуальное выделение (галочку/активный стиль) у всех опций
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === selectedTheme);
        });
    });

        initDragAndDrop();
});

    // Дополнительные опции
    document.getElementById('show-timestamps').checked = chat.appearance.showTimestamps;
    document.getElementById('show-status').checked = chat.appearance.showStatus;
}

// Изменение темы оформления
function changeTheme(theme) {
    const chat = getCurrentChat();
    chat.appearance.theme = theme;

    // Обновляем классы темы
    document.getElementById('sidebar').className = theme + '-theme';
    document.getElementById('chat-container').className = theme + '-theme';

    saveData();
}

// Сохранение настроек
function saveSettings() {
    const chat = getCurrentChat();
    chat.name = document.getElementById('chat-name-input').value;
    chat.appearance.showTimestamps = document.getElementById('show-timestamps').checked;
    chat.appearance.showStatus = document.getElementById('show-status').checked;

    saveData();
    updateChatHeader();
    renderChatList();
    renderMessages();  // ← добавьте этот вызов
}


// Очистка чата
function clearChat() {
    if (confirm("Вы уверены, что хотите очистить всю переписку?")) {
        const chat = getCurrentChat();
        chat.messages = [];
        saveData();
        renderMessages();
    }
}

// Экспорт чата
function exportChat() {
    const chat = getCurrentChat();
    const dataStr = JSON.stringify(chat, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `чат_${chat.name}_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Индикатор набора текста
function showTypingIndicator(userName) {
    const indicator = document.getElementById('typing-indicator');
    document.getElementById('typing-user').textContent = userName;
    indicator.classList.remove('hidden');
    setTimeout(() => indicator.classList.add('visible'), 10);
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    indicator.classList.remove('visible');
    setTimeout(() => indicator.classList.add('hidden'), 300);
}

// Прокрутка вниз
function scrollToBottom() {
    const messages = document.getElementById('messages');
    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: 'smooth'
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение чатов
    document.getElementById('back-button').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('visible');
    });

    // Админ-панель
    document.getElementById('admin-toggle').addEventListener('click', openAdminPanel);
    document.getElementById('close-admin').addEventListener('click', closeAdminPanel);

    // Вкладки админ-панели
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchAdminTab(tab.dataset.tab);
        });
    });

    // Управление сообщениями
    document.getElementById('send-msg').addEventListener('click', sendMessageFromAdmin);
    document.getElementById('send-btn').addEventListener('click', sendMessageFromUI);

    // Отправка по Enter (основной интерфейс)
    document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessageFromUI();
        }
    });

    // Отправка по Enter (админ-панель)
    document.getElementById('msg-text').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessageFromAdmin();
        }
    });

    // Участники
    document.getElementById('add-participant').addEventListener('click', addParticipant);

    // Выбор темы
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            changeTheme(option.dataset.theme);
        });
    });

    // Настройки
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.getElementById('clear-chat').addEventListener('click', clearChat);
    document.getElementById('export-chat').addEventListener('click', exportChat);

    // Время сообщения
    document.getElementById('msg-time').addEventListener('change', function() {
        document.getElementById('custom-time').classList.toggle('hidden', this.value !== 'custom');
    });
}

// Инициализация приложения
function initApp() {
    // Загрузка данных
    loadData();

    // Настройка обработчиков
    setupEventListeners();

    // Первоначальная отрисовка
    renderChatList();
    renderMessages();
    populateAdminPanel();
    updateChatHeader();

    // Установка активной вкладки
    switchAdminTab(state.activeAdminTab);

    // Применение темы
    const chat = getCurrentChat();
    changeTheme(chat.appearance.theme);
}
}
// Запуск приложения
window.addEventListener('DOMContentLoaded', initApp)
