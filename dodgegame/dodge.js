const player = document.getElementById("player");
const game = document.getElementById("game");

const timeEl = document.getElementById("time");
const healthEl = document.getElementById("health");
const highScoreEl = document.getElementById("highScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const finalTimeEl = document.getElementById("finalTime");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let keys = {};
let zombies = [];

let playerX = window.innerWidth / 2;
let playerY = window.innerHeight / 2;

let health = 3;
let time = 0;
let gameRunning = false;
let paused = false;

let zombieSpeed = 1.2;
let spawnRate = 2000;

let stamina = 100;

let highScore = localStorage.getItem("zombieHighScore") || 0;
highScoreEl.textContent = highScore;

document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === "p" && gameRunning) {
        paused = !paused;
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

startBtn.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    gameRunning = true;

    startSpawning();
    startTimer();
    gameLoop();
});

restartBtn.addEventListener("click", () => {
    location.reload();
});

function movePlayer() {

    let speed = 3;

    if (keys["shift"] && stamina > 0) {
        speed = 6;
        stamina -= 0.8;
    } else {
        stamina += 0.3;
    }

    stamina = Math.max(0, Math.min(100, stamina));

    if (keys["w"] || keys["arrowup"]) {
        playerY -= speed;
    }

    if (keys["s"] || keys["arrowdown"]) {
        playerY += speed;
    }

    if (keys["a"] || keys["arrowleft"]) {
        playerX -= speed;
    }

    if (keys["d"] || keys["arrowright"]) {
        playerX += speed;
    }

    playerX = Math.max(0, Math.min(window.innerWidth - 45, playerX));
    playerY = Math.max(0, Math.min(window.innerHeight - 45, playerY));

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
}

function createZombie() {

    const zombie = document.createElement("div");
    zombie.classList.add("zombie");

    let side = Math.floor(Math.random() * 4);

    let x;
    let y;

    switch (side) {
        case 0:
            x = Math.random() * window.innerWidth;
            y = -60;
            break;

        case 1:
            x = window.innerWidth + 60;
            y = Math.random() * window.innerHeight;
            break;

        case 2:
            x = Math.random() * window.innerWidth;
            y = window.innerHeight + 60;
            break;

        default:
            x = -60;
            y = Math.random() * window.innerHeight;
    }

    zombie.style.left = x + "px";
    zombie.style.top = y + "px";

    game.appendChild(zombie);

    zombies.push({
        el: zombie,
        x,
        y
    });
}

function startSpawning() {

    createZombie();

    setInterval(() => {

        if (!gameRunning) return;

        createZombie();

    }, spawnRate);
}

function moveZombies() {

    zombies.forEach((zombie) => {

        let dx = playerX - zombie.x;
        let dy = playerY - zombie.y;

        let distance = Math.sqrt(dx * dx + dy * dy);

        zombie.x += (dx / distance) * zombieSpeed;
        zombie.y += (dy / distance) * zombieSpeed;

        zombie.el.style.left = zombie.x + "px";
        zombie.el.style.top = zombie.y + "px";

        if (distance < 35) {

            health--;

            healthEl.textContent = health;

            zombie.x = Math.random() * window.innerWidth;
            zombie.y = Math.random() * window.innerHeight;

            zombie.el.style.left = zombie.x + "px";
            zombie.el.style.top = zombie.y + "px";

            player.style.transform = "scale(1.2)";

            setTimeout(() => {
                player.style.transform = "scale(1)";
            }, 100);

            if (health <= 0) {
                endGame();
            }
        }
    });
}

function startTimer() {

    setInterval(() => {

        if (!gameRunning || paused) return;

        time++;

        timeEl.textContent = time;

        if (time === 15) {
            zombieSpeed = 1.7;
        }

        if (time === 30) {
            zombieSpeed = 2.2;
        }

        if (time === 60) {
            zombieSpeed = 3;
        }

        if (time === 90) {
            zombieSpeed = 4;
        }

    }, 1000);
}

function gameLoop() {

    if (!gameRunning) return;

    requestAnimationFrame(gameLoop);

    if (paused) return;

    movePlayer();
    moveZombies();
}

function endGame() {

    gameRunning = false;

    zombies.forEach(zombie => {
        zombie.el.remove();
    });

    if (time > highScore) {
        localStorage.setItem("zombieHighScore", time);
        highScore = time;
    }

    finalTimeEl.textContent = time;

    gameOverScreen.classList.remove("hidden");
}

window.addEventListener("resize", () => {

    playerX = Math.min(playerX, window.innerWidth - 45);
    playerY = Math.min(playerY, window.innerHeight - 45);

});