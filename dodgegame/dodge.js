const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restart");
const gameOverBox = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

let playerX = 175;
let score = 0;
let gameRunning = true;

document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;

    if (e.key === "ArrowLeft" && playerX > 0) {
        playerX -= 25;
    }

    if (e.key === "ArrowRight" && playerX < 350) {
        playerX += 25;
    }

    player.style.left = playerX + "px";
});

function createBlock() {
    if (!gameRunning) return;

    const block = document.createElement("div");
    block.classList.add("block");

    const x = Math.floor(Math.random() * 8) * 50;

    block.style.left = x + "px";
    block.style.top = "-50px";

    game.appendChild(block);

    let y = -50;

    const falling = setInterval(() => {
        if (!gameRunning) {
            clearInterval(falling);
            return;
        }

        y += 5;
        block.style.top = y + "px";

        const blockRect = block.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        if (
            blockRect.left < playerRect.right &&
            blockRect.right > playerRect.left &&
            blockRect.top < playerRect.bottom &&
            blockRect.bottom > playerRect.top
        ) {
            endGame();
            clearInterval(falling);
        }

        if (y > 600) {
            score++;
            scoreElement.textContent = score;
            block.remove();
            clearInterval(falling);
        }
    }, 20);
}

function endGame() {
    gameRunning = false;
    finalScore.textContent = score;
    gameOverBox.classList.remove("hidden");
}

restartButton.addEventListener("click", () => {
    location.reload();
});

setInterval(() => {
    if (gameRunning) {
        createBlock();
    }
}, 700);