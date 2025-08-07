(function () {
    const rangeInput = document.getElementById('text-scale-range');
    const scaleValueLabel = document.getElementById('text-scale-value');

    // Обновление масштаба текста сообщений
    function updateTextScale(value) {
        scaleValueLabel.textContent = value;

        // Получаем все элементы с классом bubble
        const bubbles = document.querySelectorAll('.bubble');

        // Применяем font-size к каждому
        bubbles.forEach(bubble => {
            // Базовый размер, например, 1em, умножаем на scale
            bubble.style.fontSize = value + 'em';
        });
    }

    rangeInput.addEventListener('input', (e) => {
        const val = e.target.value;
        updateTextScale(val);
    });

    // Инициализация
    updateTextScale(rangeInput.value);
})();
