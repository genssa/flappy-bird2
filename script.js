// Проверка на Telegram WebApp
if (typeof Telegram !== "undefined" && Telegram.WebApp) {
    const tg = Telegram.WebApp;
    console.log("Telegram WebApp успешно загружен.");
    tg.expand();

    tg.onEvent("mainButtonClicked", () => {
        location.reload();
    });
} else {
    console.error("Telegram WebApp не доступен. Убедитесь, что игра открыта внутри Telegram.");
}

// Создание канваса для игры
const gameCanvas = document.createElement("canvas");
const ctx = gameCanvas.getContext("2d");
gameCanvas.width = 320;
gameCanvas.height = 480;
document.body.appendChild(gameCanvas);

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

// Функция для сохранения цвета птички
function saveBirdColor(color) {
    console.log("Сохраняю цвет птички:", color);
    localStorage.setItem("birdColor", color);
}

// Функция для загрузки цвета птички
function getSavedBirdColor() {
    const savedColor = localStorage.getItem("birdColor");
    console.log("Загружен цвет птички из localStorage:", savedColor);
    return savedColor ? savedColor : "#FF0000";  // Если нет сохранённого цвета, по умолчанию красный
}

// Получаем цвет птички из localStorage или используем красный по умолчанию
let birdColor = getSavedBirdColor();

// Функция для изменения цвета птички
function changeBirdColor(newColor) {
    birdColor = newColor;
    saveBirdColor(newColor);  // Сохраняем новый цвет
}

// Принудительное обновление кода
const CACHE_VERSION = "v2";
localStorage.setItem("cacheVersion", CACHE_VERSION);
if (localStorage.getItem("cacheVersion") !== CACHE_VERSION) {
    localStorage.clear();
    localStorage.setItem("cacheVersion", CACHE_VERSION);
    location.reload();
}

// Функция для изменения положения птички
function flap() {
    if (gameRunning) {
        birdVelocity = jump;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") flap();
});

gameCanvas.addEventListener("click", flap);

// Функция для создания трубы
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (gameCanvas.height - pipeGap));
    pipes.push({ x: gameCanvas.width, top: pipeHeight, bottom: pipeHeight + pipeGap });
}

// Функция для обновления труб
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

// Функция для проверки коллизий
function checkCollisions() {
    pipes.forEach((pipe) => {
        if (50 + 10 > pipe.x && 50 - 10 < pipe.x + pipeWidth) {
            if (birdY < pipe.top || birdY + 10 > pipe.bottom) {
                endGame();
            }
        }
    });
    if (birdY > gameCanvas.height) endGame();
}

// Функция для окончания игры
function endGame() {
    gameRunning = false;
}

// Основной игровой цикл
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

    // Рисуем птичку (тело, крыло, глаз, клюв)
    ctx.fillStyle = birdColor;
    ctx.beginPath();
    ctx.arc(50, birdY, 12, 0, Math.PI * 2); // Тело
    ctx.fill();

    ctx.fillStyle = "#FFA500";
    ctx.beginPath();
    ctx.moveTo(62, birdY - 2); // Клюв
    ctx.lineTo(68, birdY);
    ctx.lineTo(62, birdY + 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(55, birdY - 5, 2, 0, Math.PI * 2); // Глаз
    ctx.fill();

    ctx.fillStyle = birdColor;
    ctx.beginPath();
    ctx.arc(45, birdY, 6, Math.PI / 4, (3 * Math.PI) / 4); // Крыло
    ctx.fill();

    updatePipes();

    pipes.forEach((pipe) => {
        ctx.fillStyle = "#00F";
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, gameCanvas.height - pipe.bottom);
    });

    checkCollisions();
}

// Запуск игрового цикла
setInterval(gameLoop, 1000 / 60);
