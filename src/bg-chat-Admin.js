document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chat-container');
  const bgUpload = document.getElementById('chat-bg-upload');
  const clearBgBtn = document.getElementById('clear-chat-bg');

  // При выборе файла
  bgUpload.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверим, что это изображение
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      // Устанавливаем фоновое изображение
      chatContainer.style.backgroundImage = `url(${e.target.result})`;
      chatContainer.style.backgroundSize = 'cover';
      chatContainer.style.backgroundPosition = 'center';

      // Можно сохранить в localStorage для сохранения при перезагрузке
      localStorage.setItem('chatBackground', e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Сброс значения input чтобы можно было загружать тот же файл повторно
    bgUpload.value = '';
  });

  // Кнопка очистки фона
  clearBgBtn.addEventListener('click', () => {
    chatContainer.style.backgroundImage = '';
    localStorage.removeItem('chatBackground');
  });

  // При загрузке страницы ставим сохраненный фон из localStorage, если есть
  const savedBg = localStorage.getItem('chatBackground');
  if (savedBg) {
    chatContainer.style.backgroundImage = `url(${savedBg})`;
    chatContainer.style.backgroundSize = 'cover';
    chatContainer.style.backgroundPosition = 'center';
  }
});
