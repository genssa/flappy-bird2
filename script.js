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

const restartButton = document.getElementById("restartButton");
restartButton.style.display = "none";

function flap() {
    if (gameRunning) {
        birdVelocity = jump;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") flap();
});

gameCanvas.addEventListener("click", flap);

function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (gameCanvas.height - pipeGap));
    pipes.push({ x: gameCanvas.width, top: pipeHeight, bottom: pipeHeight + pipeGap });
}

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

function endGame() {
    gameRunning = false;
    showRestartButton();
}

function showRestartButton() {
    restartButton.style.display = "block";
}

restartButton.addEventListener("click", () => {
    location.reload();
});

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
    ctx.fillStyle = "#F00";
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

setInterval(gameLoop, 1000 / 60);
