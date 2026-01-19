// ================================
// Game Constants & Variables
// ================================
let gameStarted = false;
let inputDir = { x: 0, y: 0 };

const foodSound = new Audio('music/food.mp3');
const gameOverSound = new Audio('music/gameover.mp3');
const moveSound = new Audio('music/move.mp3');
const musicSound = new Audio('music/music.mp3');

let speed = 14;
let score = 0;
let lastPaintTime = 0;
let gameOver = false;

let snakeArr = [{ x: 13, y: 15 }];
let food = { x: 6, y: 7 };

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// DOM Elements
const board = document.getElementById("board");
const scoreBox = document.getElementById("scoreBox");
const hiscoreBox = document.getElementById("hiscoreBox");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const gameContainer = document.getElementById("gameContainer");

// ================================
// Main Game Loop
// ================================
function main(ctime) {
    if (gameOver || !gameStarted) return;

    window.requestAnimationFrame(main);

    if ((ctime - lastPaintTime) / 1000 < 1 / speed) return;

    lastPaintTime = ctime;
    gameEngine();
}

// ================================
// Collision Detection
// ================================
function isCollide(snake) {
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }

    // Wall collision
    if (
        snake[0].x >= 18 || snake[0].x <= 0 ||
        snake[0].y >= 18 || snake[0].y <= 0
    ) {
        return true;
    }

    return false;
}

// ================================
// Game Engine
// ================================
function gameEngine() {

    // Game Over
    if (isCollide(snakeArr)) {
        gameOver = true;
        gameOverSound.play();
        musicSound.pause();
        inputDir = { x: 0, y: 0 };

        finalScore.innerText = score;
        gameOverScreen.style.visibility = "visible";
        board.classList.add("blur");
        return;
    }

    // Food eaten
    if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
        foodSound.play();
        score++;

        if (score > hiscoreval) {
            hiscoreval = score;
            localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
            hiscoreBox.innerHTML = "HiScore: " + hiscoreval;
        }

        scoreBox.innerHTML = "Score: " + score;

        snakeArr.unshift({
            x: snakeArr[0].x + inputDir.x,
            y: snakeArr[0].y + inputDir.y
        });

        let a = 2;
        let b = 16;
        food = {
            x: Math.floor(a + (b - a) * Math.random()),
            y: Math.floor(a + (b - a) * Math.random())
        };
    }

    // Move snake
    for (let i = snakeArr.length - 2; i >= 0; i--) {
        snakeArr[i + 1] = { ...snakeArr[i] };
    }

    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    // Draw snake & food
    board.innerHTML = "";

    snakeArr.forEach((e, index) => {
        let snakeElement = document.createElement("div");
        snakeElement.style.gridRowStart = e.y;
        snakeElement.style.gridColumnStart = e.x;

        if (index === 0) {
            snakeElement.classList.add("head");
            
            // Add rotation based on direction
            let rotation = 0;
            if (inputDir.x === 1) rotation = 0; // Right
            else if (inputDir.x === -1) rotation = 180; // Left
            else if (inputDir.y === 1) rotation = 90; // Down
            else if (inputDir.y === -1) rotation = 270; // Up
            
            snakeElement.style.transform = `rotate(${rotation}deg)`;
            
            // Create eyes container
            let eyesContainer = document.createElement("div");
            eyesContainer.className = "eyes";
            
            // Create left eye
            let leftEye = document.createElement("div");
            leftEye.className = "eye";
            eyesContainer.appendChild(leftEye);
            
            // Create right eye
            let rightEye = document.createElement("div");
            rightEye.className = "eye";
            eyesContainer.appendChild(rightEye);
            
            snakeElement.appendChild(eyesContainer);
        } else {
            snakeElement.classList.add("snake");
        }
        
        board.appendChild(snakeElement);
    });

    let foodElement = document.createElement("div");
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add("food");
    board.appendChild(foodElement);
}

// ================================
// Restart Game
// ================================
function restartGame() {
    snakeArr = [{ x: 13, y: 15 }];
    inputDir = { x: 0, y: 0 };
    score = 0;
    scoreBox.innerHTML = "Score: 0";

    gameOver = false;
    gameOverScreen.style.visibility = "hidden";
    board.classList.remove("blur");

    lastPaintTime = 0;
    musicSound.currentTime = 0;
    musicSound.play();

    window.requestAnimationFrame(main);
}

// ================================
// Hi-Score
// ================================
let hiscore = localStorage.getItem("hiscore");
let hiscoreval;

if (hiscore === null) {
    hiscoreval = 0;
    localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
} else {
    hiscoreval = JSON.parse(hiscore);
    hiscoreBox.innerHTML = "HiScore: " + hiscoreval;
}

// ================================
// Controls
// ================================
window.addEventListener("keydown", e => {
    if (gameOver || !gameStarted) return;

    moveSound.play();

    switch (e.key) {
        case "ArrowUp":
            inputDir = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            inputDir = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            inputDir = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            inputDir = { x: 1, y: 0 };
            break;
    }
});

// ================================
// Start Game Function
// ================================
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    startScreen.style.display = "none";
    gameContainer.style.display = "flex";
    musicSound.play();
    window.requestAnimationFrame(main);
}

// Start Screen Event Listeners
startBtn.addEventListener("click", startGame);
startScreen.addEventListener("click", startGame);

// Keyboard event for Enter/Space to start
window.addEventListener("keydown", (e) => {
    if (!gameStarted && (e.key === " " || e.key === "Enter")) {
        startGame();
    }
}, true);

// ================================
// Mobile Touch Controls
// ================================

window.addEventListener("touchstart", (e) => {
    if (!gameStarted) {
        startGame();
        return;
    }
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});

window.addEventListener("touchend", (e) => {
    if (gameOver || !gameStarted) return;

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    handleSwipe();
});
function handleSwipe() {
    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    // Ignore very small swipes
    if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) return;

    moveSound.play();

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) {
            inputDir = { x: 1, y: 0 }; // Right
        } else {
            inputDir = { x: -1, y: 0 }; // Left
        }
    } else {
        // Vertical swipe
        if (diffY > 0) {
            inputDir = { x: 0, y: 1 }; // Down
        } else {
            inputDir = { x: 0, y: -1 }; // Up
        }
    }
}

