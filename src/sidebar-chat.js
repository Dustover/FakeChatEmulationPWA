// Элементы
const newChatButton = document.getElementById('new-chat');
const modal = document.getElementById('new-chat-modal');
const chatNameInputModal = document.getElementById('chat-name-input-modal');
const chatMessageInputModal = document.getElementById('chat-message-input-modal');
const addChatConfirm = document.getElementById('add-chat-confirm');
const addChatCancel = document.getElementById('add-chat-cancel');
const chatList = document.getElementById('chat-list');

// Показать модалку
newChatButton.addEventListener('click', () => {
  modal.classList.remove('hidden');
  chatNameInputModal.value = '';
  chatMessageInputModal.value = '';
  chatNameInputModal.focus();
});

// Скрыть модалку
function closeModal() {
  modal.classList.add('hidden');
}
addChatCancel.addEventListener('click', closeModal);

// Функция создания chat-item по заданным параметрам
function createChatItem(name, lastMessage = '') {
  const chatItem = document.createElement('div');
  chatItem.className = 'chat-item';

  const avatarPlaceholder = document.createElement('div');
  avatarPlaceholder.className = 'avatar-placeholder';

  const chatInfo = document.createElement('div');
  chatInfo.className = 'chat-info';

  const chatNameDiv = document.createElement('div');
  chatNameDiv.className = 'chat-name';
  chatNameDiv.textContent = name;

  const lastMsgDiv = document.createElement('div');
  lastMsgDiv.className = 'last-message';
  lastMsgDiv.textContent = lastMessage;

  chatInfo.appendChild(chatNameDiv);
  chatInfo.appendChild(lastMsgDiv);

  chatItem.appendChild(avatarPlaceholder);
  chatItem.appendChild(chatInfo);

  return chatItem;
}

// Добавить новый чат в список по нажатию кнопки в модалке
addChatConfirm.addEventListener('click', () => {
  const name = chatNameInputModal.value.trim();
  const message = chatMessageInputModal.value.trim();

  if (!name) {
    alert('Пожалуйста, введите название чата');
    chatNameInputModal.focus();
    return;
  }

  const newChatItem = createChatItem(name, message);
  chatList.appendChild(newChatItem);

  closeModal();
});


