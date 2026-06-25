const game = document.getElementById("game");
const player = document.getElementById("player");

const healthEl = document.getElementById("health");
const scoreEl = document.getElementById("score");
const waveEl = document.getElementById("wave");
const coinsEl = document.getElementById("coins");
const staminaEl = document.getElementById("stamina");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScoreEl = document.getElementById("finalScore");
const finalWaveEl = document.getElementById("finalWave");
const highScoreEl = document.getElementById("highScore");

const waveMessage = document.getElementById("waveMessage");
const crosshair = document.getElementById("crosshair");

let keys = {};
let zombies = [];
let bullets = [];
let coins = [];
let particles = [];

let running = false;
let paused = false;

let playerX = window.innerWidth / 2;
let playerY = window.innerHeight / 2;

let mouseX = 0;
let mouseY = 0;

let health = 5;
let score = 0;
let wave = 1;
let money = 0;
let stamina = 100;

let highScore = localStorage.getItem("zombieHighScore") || 0;
highScoreEl.textContent = highScore;

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === "p" && running) {
        paused = !paused;

        if (paused) {
            pauseScreen.classList.remove("hidden");
        } else {
            pauseScreen.classList.add("hidden");
        }
    }
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    crosshair.style.left = mouseX + "px";
    crosshair.style.top = mouseY + "px";
});

startBtn.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    running = true;

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

    showWave();
    spawnWave();
    loop();
});

restartBtn.addEventListener("click", () => {
    location.reload();
});

document.addEventListener("click", e => {
    if (!running || paused) return;
    if (e.target.tagName === "BUTTON") return;

    shoot();
});

function shoot() {
    const bullet = document.createElement("div");

    bullet.className = "bullet";

    game.appendChild(bullet);

    const dx = mouseX - playerX;
    const dy = mouseY - playerY;

    const distance = Math.hypot(dx, dy);

    bullets.push({
        el: bullet,
        x: playerX,
        y: playerY,
        dx: dx / distance,
        dy: dy / distance,
        speed: 12
    });
}

function movePlayer() {

    let speed = 4;

    if (keys["shift"] && stamina > 0) {
        speed = 7;
        stamina -= 0.7;
    } else {
        stamina += 0.35;
    }

    stamina = Math.max(0, Math.min(100, stamina));

    staminaEl.textContent = Math.floor(stamina);

    if (keys["w"] || keys["arrowup"]) playerY -= speed;
    if (keys["s"] || keys["arrowdown"]) playerY += speed;
    if (keys["a"] || keys["arrowleft"]) playerX -= speed;
    if (keys["d"] || keys["arrowright"]) playerX += speed;

    playerX = Math.max(20, Math.min(window.innerWidth - 20, playerX));
    playerY = Math.max(20, Math.min(window.innerHeight - 20, playerY));

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
}

function createZombie() {

    const zombie = document.createElement("div");

    let hp = 1;
    let speed = 1.4;
    let reward = 1;

    const roll = Math.random();

    zombie.classList.add("zombie");

    if (roll > 0.75) {
        zombie.classList.add("fastZombie");
        hp = 1;
        speed = 3;
        reward = 2;
    }

    if (roll > 0.93) {
        zombie.classList.remove("fastZombie");
        zombie.classList.add("tankZombie");
        hp = 5;
        speed = 0.9;
        reward = 5;
    }

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
        y,
        hp,
        speed,
        reward
    });
}

function spawnWave() {

    const count = 5 + wave * 2;

    for (let i = 0; i < count; i++) {
        createZombie();
    }
}

function showWave() {

    waveMessage.textContent = "WAVE " + wave;

    waveMessage.style.opacity = "1";

    setTimeout(() => {
        waveMessage.style.opacity = "0";
    }, 2000);
}

function createBlood(x, y) {

    for (let i = 0; i < 8; i++) {

        const p = document.createElement("div");

        p.className = "particle";

        game.appendChild(p);

        particles.push({
            el: p,
            x,
            y,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 0.5) * 6,
            life: 40
        });
    }
}

function createCoin(x, y) {

    const coin = document.createElement("div");

    coin.className = "coin";

    coin.style.left = x + "px";
    coin.style.top = y + "px";

    game.appendChild(coin);

    coins.push({
        el: coin,
        x,
        y
    });
}function moveBullets() {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const b = bullets[i];

        b.x += b.dx * b.speed;
        b.y += b.dy * b.speed;

        b.el.style.left = b.x + "px";
        b.el.style.top = b.y + "px";

        if (
            b.x < -50 ||
            b.y < -50 ||
            b.x > window.innerWidth + 50 ||
            b.y > window.innerHeight + 50
        ) {
            b.el.remove();
            bullets.splice(i, 1);
            continue;
        }

        for (let z = zombies.length - 1; z >= 0; z--) {

            const zombie = zombies[z];

            const dist = Math.hypot(
                b.x - zombie.x,
                b.y - zombie.y
            );

            if (dist < 28) {

                zombie.hp--;

                createBlood(zombie.x, zombie.y);

                b.el.remove();
                bullets.splice(i, 1);

                if (zombie.hp <= 0) {

                    score += 10;
                    scoreEl.textContent = score;

                    for (let c = 0; c < zombie.reward; c++) {
                        createCoin(
                            zombie.x + Math.random() * 30 - 15,
                            zombie.y + Math.random() * 30 - 15
                        );
                    }

                    zombie.el.remove();
                    zombies.splice(z, 1);

                    if (zombies.length === 0) {

                        wave++;

                        waveEl.textContent = wave;

                        showWave();

                        setTimeout(() => {
                            spawnWave();
                        }, 1500);
                    }
                }

                break;
            }
        }
    }
}

function moveZombies() {

    for (let i = zombies.length - 1; i >= 0; i--) {

        const z = zombies[i];

        const dx = playerX - z.x;
        const dy = playerY - z.y;

        const dist = Math.hypot(dx, dy);

        z.x += (dx / dist) * z.speed;
        z.y += (dy / dist) * z.speed;

        z.el.style.left = z.x + "px";
        z.el.style.top = z.y + "px";

        if (dist < 35) {

            health--;

            healthEl.textContent = health;

            player.classList.add("damage");

            setTimeout(() => {
                player.classList.remove("damage");
            }, 250);

            z.el.remove();
            zombies.splice(i, 1);

            if (health <= 0) {
                gameOver();
            }
        }
    }
}

function moveParticles() {

    for (let i = particles.length - 1; i >= 0; i--) {

        const p = particles[i];

        p.x += p.dx;
        p.y += p.dy;

        p.life--;

        p.el.style.left = p.x + "px";
        p.el.style.top = p.y + "px";

        p.el.style.opacity = p.life / 40;

        if (p.life <= 0) {
            p.el.remove();
            particles.splice(i, 1);
        }
    }
}

function collectCoins() {

    for (let i = coins.length - 1; i >= 0; i--) {

        const coin = coins[i];

        const dist = Math.hypot(
            playerX - coin.x,
            playerY - coin.y
        );

        if (dist < 35) {

            money++;

            coinsEl.textContent = money;

            coin.el.remove();

            coins.splice(i, 1);

            if (money >= 20 && health < 5) {

                money -= 20;
                health++;

                coinsEl.textContent = money;
                healthEl.textContent = health;
            }
        }
    }
}

function gameOver() {

    running = false;

    finalScoreEl.textContent = score;
    finalWaveEl.textContent = wave;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem(
            "zombieHighScore",
            highScore
        );
    }

    highScoreEl.textContent = highScore;

    gameOverScreen.classList.remove("hidden");
}

function loop() {

    if (!running) return;

    requestAnimationFrame(loop);

    if (paused) return;

    movePlayer();
    moveBullets();
    moveZombies();
    moveParticles();
    collectCoins();
}

window.addEventListener("resize", () => {

    playerX = Math.min(
        playerX,
        window.innerWidth - 20
    );

    playerY = Math.min(
        playerY,
        window.innerHeight - 20
    );
});