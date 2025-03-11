// Проверка, доступен ли Telegram WebApp API
if (typeof Telegram !== "undefined" && Telegram.WebApp) {
    const tg = Telegram.WebApp;

    // Разворачиваем Mini App на весь экран
    tg.expand(); 

    // Отображаем кнопку "Начать заново" внизу экрана
    tg.MainButton.setText("Начать заново");
    tg.MainButton.show();

    // При нажатии на кнопку "Начать заново" перезапускаем игру
    tg.onEvent("mainButtonClicked", () => {
        location.reload(); // Перезагружаем страницу (перезапуск игры)
    });
} else {
    console.error("Telegram WebApp не доступен. Убедитесь, что игра открыта внутри Telegram.");
}

// Создаем холст для игры
const gameCanvas = document.createElement("canvas");
const ctx = gameCanvas.getContext("2d");
gameCanvas.width = 320;
gameCanvas.height = 480;
document.body.appendChild(gameCanvas);

// Переменные игры
let birdY = 150;          // Начальная позиция птички по Y
let birdVelocity = 0;     // Начальная скорость птички
const gravity = 0.5;      // Сила гравитации
const jump = -8;          // Сила прыжка
let pipes = [];           // Массив для труб
let score = 0;            // Счет
let gameRunning = true;   // Статус игры

// Обработчик клика по экрану или нажатия пробела
function flap() {
    birdVelocity = jump; // Птичка подскакивает
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        flap(); // Нажатие пробела
    }
});

gameCanvas.addEventListener("click", flap); // Клик по холсту

// Функция для создания труб
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (gameCanvas.height / 2)); // Рандомная высота трубы
    pipes.push({
        x: gameCanvas.width,
        top: pipeHeight,
        bottom: gameCanvas.height - pipeHeight - 100, // Разрыв между трубами
        width: 30,
        speed: 2
    });
}

// Функция для обновления труб
function updatePipes() {
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipes[i].speed; // Двигаем трубу влево

        // Если труба выходит за экран, удаляем ее
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
            score++; // Увеличиваем счет за каждую пройденную трубу
            i--; // Корректируем индекс после удаления
        }
    }
}

// Функция для отрисовки труб
function drawPipes() {
    for (let i = 0; i < pipes.length; i++) {
        // Верхняя труба
        ctx.fillStyle = "#00F";
        ctx.fillRect(pipes[i].x, 0, pipes[i].width, pipes[i].top);

        // Нижняя труба
        ctx.fillStyle = "#00F";
        ctx.fillRect(pipes[i].x, gameCanvas.height - pipes[i].bottom, pipes[i].width, pipes[i].bottom);
    }
}

// Функция для проверки столкновений с трубами
function checkCollisions() {
    for (let i = 0; i < pipes.length; i++) {
        if (
            birdY < pipes[i].top || // Если птичка выше верхней трубы
            birdY + 10 > gameCanvas.height - pipes[i].bottom // Если птичка ниже нижней трубы
        ) {
            if (50 > pipes[i].x && 50 < pipes[i].x + pipes[i].width) { // Если птичка в пределах трубы
                gameRunning = false; // Конец игры
            }
        }
    }
}

// Основная функция игры (обновление экрана)
function gameLoop() {
    if (!gameRunning) {
        ctx.font = "40px Arial";
        ctx.fillStyle = "#F00";
        ctx.fillText("Игра завершена", 50, gameCanvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Нажмите 'Начать заново'", 70, gameCanvas.height / 2 + 40);
        return;
    }

    birdVelocity += gravity; // Применяем гравитацию
    birdY += birdVelocity;   // Обновляем позицию птички

    // Ограничиваем положение птички, чтобы она не выходила за пределы экрана
    if (birdY < 0) birdY = 0;
    if (birdY > gameCanvas.height) birdY = gameCanvas.height;

    // Очистка экрана перед отрисовкой нового кадра
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Рисуем птичку (круг)
    ctx.beginPath();
    ctx.arc(50, birdY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#FF0"; // Цвет птички
    ctx.fill();
    ctx.closePath();

    // Отрисовываем и обновляем трубы
    updatePipes();
    drawPipes();

    // Проверка на столкновение с трубами
    checkCollisions();

    // Обновляем счет
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("Счет: " + score, 10, 30);
}

// Вызов основной функции игры 60 раз в секунду
setInterval(gameLoop, 1000 / 60);

// Генерация труб каждые 2 секунды
setInterval(createPipe, 2000);
