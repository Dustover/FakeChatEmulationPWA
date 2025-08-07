/**
 * Переключение темы светлая/тёмная.
 * @param {"light"|"dark"} theme - желаемая тема
 */
function switchTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark-theme');
    } else if (theme === 'light') {
        root.classList.remove('dark-theme');
    }
    // Можно добавить сохранение в localStorage
    localStorage.setItem('preferredTheme', theme);
}

/**
 * Получить сохранённую тему из localStorage или по умолчанию 'light'
 * @returns {"light"|"dark"}
 */
function getPreferredTheme() {
    const saved = localStorage.getItem('preferredTheme');
    if (saved === 'dark' || saved === 'light') {
        return saved;
    }
    // По умолчанию light
    return 'light';
}

/**
 * Инициализация темы при загрузке страницы
 */
function initTheme() {
    const theme = getPreferredTheme();
    switchTheme(theme);
    // Обновить переключатель в панели (если есть)
    const inputs = document.querySelectorAll('input[name="theme-mode"]');
    inputs.forEach(input => {
        input.checked = (input.value === theme);
    });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // Подключаем обработчики переключателей
    document.querySelectorAll('input[name="theme-mode"]').forEach(input => {
        input.addEventListener('change', () => {
            if (input.checked) {
                switchTheme(input.value);
            }
        });
    });
});
