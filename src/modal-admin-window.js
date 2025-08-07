const panel = document.getElementById('admin-panel');
const header = panel.querySelector('.admin-header');

let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

header.onmousedown = dragMouseDown;

function dragMouseDown(e) {
  e.preventDefault();
  // Начальные координаты мыши
  mouseX = e.clientX;
  mouseY = e.clientY;
  // Навешиваем обработчики на движение и отпускание мыши
  document.onmouseup = closeDragElement;
  document.onmousemove = elementDrag;
}

function elementDrag(e) {
  e.preventDefault();
  // Вычисляем смещение
  posX = mouseX - e.clientX;
  posY = mouseY - e.clientY;
  mouseX = e.clientX;
  mouseY = e.clientY;
  // Обновляем позицию панели, отнимая смещение
  // Получаем текущие координаты панели
  const rect = panel.getBoundingClientRect();
  let newTop = rect.top - posY;
  let newLeft = rect.left - posX;

  // Ограничения, чтобы панель не ушла за экран:
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const panelWidth = rect.width;
  const panelHeight = rect.height;

  if (newTop < 0) newTop = 0;
  if (newLeft < 0) newLeft = 0;
  if (newTop + panelHeight > windowHeight) newTop = windowHeight - panelHeight;
  if (newLeft + panelWidth > windowWidth) newLeft = windowWidth - panelWidth;

  // Устанавливаем новые координаты
  panel.style.top = newTop + "px";
  panel.style.left = newLeft + "px";
  // Снимаем right (чтобы не конфликтовало с left)
  panel.style.right = "auto";
}

function closeDragElement() {
  // Удаляем обработчики движения и отпускания мыши
  document.onmouseup = null;
  document.onmousemove = null;
}
