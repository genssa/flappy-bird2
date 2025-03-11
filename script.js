if (typeof Telegram !== "undefined" && Telegram.WebApp) {
    const tg = Telegram.WebApp;
    tg.expand();

    tg.onEvent("mainButtonClicked", () => {
        location.reload(); // Перезапуск игры
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

// Получаем кнопку из HTML
const restartButton = document.getElementById("restartButton");

// Переменные игры
let birdY = 150;
let birdVelocity = 0;
const gravity = 0.5;
const jump = -8;
let pipes = [];
let score = 0;
let gameRunning = true;
let pipeGap = 100;
let pipeWidth = 50;
let pipeInterval = 1500;
let lastPipeTime = Date.now();

// Функция для прыжка
function flap() {
    if (gameRunning) {
        birdVelocity = jump;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        flap();
    }
});

gameCanvas.addEventListener("click", flap);

// Функция создания труб
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (gameCanvas.height - pipeGap));
    pipes.push({ x: gameCanvas.width, top: pipeHeight, bottom: pipeHeight + pipeGap });
}

// Функция обновления труб
function updatePipes() {
    if (Date.now() - lastPipeTime > pipeInterval) {
        createPipe();
        lastPipeTime = Date.now();
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= 2;

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
            score++;
        }
    });
}

// Функция проверки столкновений
function checkCollisions() {
    pipes.forEach((pipe) => {
        if (50 + 10 > pipe.x && 50 - 10 < pipe.x + pipeWidth) {
            if (birdY < pipe.top || birdY + 10 > pipe.bottom) {
                endGame();
            }
        }
    });

    if (birdY > gameCanvas.height) {
        endGame();
    }
}

// Функция завершения игры
function endGame() {
    gameRunning = false;

    // Показываем кнопку в WebApp
    if (typeof Telegram !== "undefined" && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        tg.MainButton.setText("Начать заново");
        tg.MainButton.show();
    }

    // Показываем HTML-кнопку
    restartButton.style.display = "block";
}

// Основная функция игры
function gameLoop() {
    if (!gameRunning) {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.font = "30px Arial";
        ctx.fillStyle = "#000";
        ctx.fillText("Игра окончена! Счет: " + score, 50, 240);
        return;
    }

    birdVelocity += gravity;
    birdY += birdVelocity;
    if (birdY < 0) birdY = 0;
    if (birdY > gameCanvas.height) birdY = gameCanvas.height;

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    ctx.beginPath();
    ctx.arc(50, birdY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#FF0";
    ctx.fill();
    ctx.closePath();

    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("Счет: " + score, 10, 30);

    updatePipes();

    pipes.forEach((pipe) => {
        ctx.fillStyle = "#00F";
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, gameCanvas.height - pipe.bottom);
    });

    checkCollisions();
}

// Запуск игры
setInterval(gameLoop, 1000 / 60);

// Обработчик нажатия кнопки
restartButton.addEventListener("click", () => {
    location.reload();
});
