function getMessageTimestamp(selectedValue, customTimeValue) {
    const now = new Date();
    
    if (selectedValue === 'now') {
        return now.toISOString();
    } else if (selectedValue === '5min') {
        return new Date(now.getTime() + 5 * 60000).toISOString();
    } else if (selectedValue === '1h') {
        return new Date(now.getTime() + 60 * 60000).toISOString();
    } else if (selectedValue === 'custom') {
        if (customTimeValue) {
            // Проверяем формат customTimeValue (должен быть 'YYYY-MM-DDTHH:mm')
            const dt = new Date(customTimeValue);
            if (!isNaN(dt)) {
                return dt.toISOString();
            } else {
                console.warn('Неверный формат кастомного времени:', customTimeValue);
                return now.toISOString();
            }
        } else {
            return now.toISOString();
        }
    } else {
        return now.toISOString();
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

    const selectedTime = timeSelect.value;
    const customTimeValue = customTimeInput && !customTimeInput.classList.contains('hidden')
        ? customTimeInput.value
        : null;

    const timestamp = getMessageTimestamp(selectedTime, customTimeValue);

    console.log('Отправка сообщения из админ-панели:');
    console.log('  selectedTime:', selectedTime);
    console.log('  customTimeValue:', customTimeValue);
    console.log('  calculated timestamp:', timestamp);

    addMessageWithCustomTime(senderId, text, timestamp);

    textInput.value = '';
}

// Если хотите очистить старые данные и начать с чистого листа — раскомментируйте:
// localStorage.removeItem('fakeChatData');
// location.reload();

function addMessageWithCustomTime(senderId, text, timestamp) {
    const chat = getCurrentChat();
    if (!chat) {
        console.error('Текущий чат не найден');
        return;
    }

    // Дополнительно: логируем новый объект сообщения
    const newMessage = {
        id: Date.now(),
        senderId,
        text,
        timestamp,
        status: "sent"
    };

    console.log('Добавляем сообщение:', newMessage);

    chat.messages.push(newMessage);
    saveData();
    renderMessages();

    const otherParticipant = chat.participants.find(p => p.id !== senderId);
    if (otherParticipant) {
        showTypingIndicator(otherParticipant.name);
        setTimeout(hideTypingIndicator, 2000);
    }
}
