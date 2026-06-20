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
let playerX = window.innerWidth / 2;
let playerY = window.innerHeight / 2;

let zombies = [];
let health = 3;
let time = 0;
let gameRunning = false;
let speedBoost = 1;

let highScore = localStorage.getItem("zombieHighScore") || 0;
highScoreEl.textContent = highScore;

document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

startBtn.onclick = () => {
    startScreen.classList.add("hidden");
    gameRunning = true;
    loop();
    spawnZombies();
    timer();
};

restartBtn.onclick = () => location.reload();

function movePlayer() {
    let speed = keys["shift"] ? 6 : 3;

    if (keys["w"] || keys["arrowup"]) playerY -= speed;
    if (keys["s"] || keys["arrowdown"]) playerY += speed;
    if (keys["a"] || keys["arrowleft"]) playerX -= speed;
    if (keys["d"] || keys["arrowright"]) playerX += speed;

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
}

function createZombie() {
    const z = document.createElement("div");
    z.classList.add("zombie");

    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;

    z.style.left = x + "px";
    z.style.top = y + "px";

    game.appendChild(z);

    zombies.push({ el: z, x, y });
}

function spawnZombies() {
    setInterval(() => {
        if (!gameRunning) return;
        createZombie();
    }, 2000);
}

function moveZombies() {
    zombies.forEach(z => {
        let dx = playerX - z.x;
        let dy = playerY - z.y;

        let dist = Math.sqrt(dx * dx + dy * dy);

        z.x += (dx / dist) * (1.2 * speedBoost);
        z.y += (dy / dist) * (1.2 * speedBoost);

        z.el.style.left = z.x + "px";
        z.el.style.top = z.y + "px";

        if (dist < 30) {
            health--;
            healthEl.textContent = health;

            z.x = Math.random() * window.innerWidth;
            z.y = Math.random() * window.innerHeight;

            if (health <= 0) endGame();
        }
    });
}


function timer() {
    setInterval(() => {
        if (!gameRunning) return;

        time++;
        timeEl.textContent = time;

        speedBoost += 0.05;

    }, 1000);
}

function loop() {
    if (!gameRunning) return;

    movePlayer();
    moveZombies();

    requestAnimationFrame(loop);
}

function endGame() {
    gameRunning = false;

    if (time > highScore) {
        localStorage.setItem("zombieHighScore", time);
    }

    finalTimeEl.textContent = time;
    gameOverScreen.classList.remove("hidden");
}