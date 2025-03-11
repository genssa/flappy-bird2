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
let pipeGap = 100;        // Расстояние между трубами
let pipeWidth = 50;       // Ширина труб
let pipeInterval = 1500;  // Интервал появления новых труб
let lastPipeTime = Date.now(); // Время последнего появления труб

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

// Функция для создания новых труб
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (gameCanvas.height - pipeGap));
    pipes.push({
        x: gameCanvas.width,
        top: pipeHeight,
        bottom: pipeHeight + pipeGap
    });
}

// Функция для обновления труб
function updatePipes() {
    if (Date.now() - lastPipeTime > pipeInterval) {
        createPipe();
        lastPipeTime = Date.now();
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= 2; // Двигаем трубы влево

        // Если труба вышла за пределы экрана, удаляем её
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
            score++; // Увеличиваем счет
        }
    });
}

// Функция для проверки столкновений
function checkCollisions() {
    pipes.forEach((pipe) => {
        if (50 + 10 > pipe.x && 50 - 10 < pipe.x + pipeWidth) {
            if (birdY < pipe.top || birdY + 10 > pipe.bottom) {
                gameRunning = false; // Столкновение с трубой
            }
        }
    });

    // Проверка на столкновение с землей
    if (birdY > gameCanvas.height) {
        gameRunning = false;
    }
}

// Основная функция игры (обновление экрана)
function gameLoop() {
    if (!gameRunning) {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.font = "30px Arial";
        ctx.fillStyle = "#000";
        ctx.fillText("Игра окончена! Счет: " + score, 50, 240);
        
        // Показываем кнопку "Начать заново" после окончания игры
        if (typeof Telegram !== "undefined" && Telegram.WebApp) {
            tg.MainButton.show();
        }

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

    // Обновляем счет
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("Счет: " + score, 10, 30);

    // Обновляем трубы
    updatePipes();

    // Рисуем трубы
    pipes.forEach((pipe) => {
        ctx.fillStyle = "#00F";
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top); // Верхняя труба
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, gameCanvas.height - pipe.bottom); // Нижняя труба
    });

    // Проверка на столкновения
    checkCollisions();
}

// Вызов основной функции игры 60 раз в секунду
setInterval(gameLoop, 1000 / 60);
