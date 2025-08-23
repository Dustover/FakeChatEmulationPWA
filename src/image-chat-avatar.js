document.getElementById('change-chat-photo').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Элемент аватара верхнего чата
    const avatarPlaceholder = document.querySelector('#chat-container .avatar-placeholder');

    if (!avatarPlaceholder) return;

    const imageUrl = URL.createObjectURL(file);

    avatarPlaceholder.style.backgroundImage = `url('${imageUrl}')`;
    avatarPlaceholder.style.backgroundSize = 'cover';
    avatarPlaceholder.style.backgroundPosition = 'center';
});
