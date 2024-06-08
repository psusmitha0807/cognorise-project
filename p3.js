let can = document.getElementById("table");
let draw = can.getContext('2d');

const ball = {
    x: can.width / 2,
    y: can.height / 2,
    radius: 10,
    velX: 5,
    velY: 5,
    speed: 5,
    color: "black"
};

const user = {
    x: 0,
    y: (can.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "red",
    dy: 0 // velocity for the user paddle
};

const cpu = {
    x: can.width - 10,
    y: (can.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "red",
    dy: 0 // velocity for the cpu paddle
};

const sep = {
    x: (can.width - 2) / 2,
    y: 0,
    height: 10,
    width: 2,
    color: "white"
};

let gameLoop;
let isGamePaused = false;

function drawRectangle(x, y, w, h, color) {
    draw.fillStyle = color;
    draw.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    draw.fillStyle = color;
    draw.beginPath();
    draw.arc(x, y, r, 0, Math.PI * 2, true);
    draw.closePath();
    draw.fill();
}

function drawScore(text, x, y) {
    draw.fillStyle = "white";
    draw.font = "60px Arial";
    draw.fillText(text, x, y);
}

function drawSeparator() {
    for (let i = 0; i <= can.height; i += 20) {
        drawRectangle(sep.x, sep.y + i, sep.width, sep.height, sep.color);
    }
}

function render() {
    // Clear the canvas
    draw.clearRect(0, 0, can.width, can.height);
    
    // Draw the game objects
    drawRectangle(0, 0, can.width, can.height, "pink");
    drawScore(user.score, can.width / 4, can.height / 5);
    drawScore(cpu.score, 3 * can.width / 4, can.height / 5);
    drawSeparator();
    drawRectangle(user.x, user.y, user.width, user.height, user.color);
    drawRectangle(cpu.x, cpu.y, cpu.width, cpu.height, cpu.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

function resetBall() {
    ball.x = can.width / 2;
    ball.y = can.height / 2;
    ball.velX = -ball.velX;
    ball.speed = 5;
}

function update() {
    if (isGamePaused) return;

    ball.x += ball.velX;
    ball.y += ball.velY;

    // Update user paddle position
    user.y += user.dy;

    // Update CPU paddle position
    cpu.y += cpu.dy;

    // Prevent user paddle from going out of canvas
    if (user.y < 0) user.y = 0;
    if (user.y + user.height > can.height) user.y = can.height - user.height;

    // Prevent CPU paddle from going out of canvas
    if (cpu.y < 0) cpu.y = 0;
    if (cpu.y + cpu.height > can.height) cpu.y = can.height - cpu.height;

    if (ball.y + ball.radius > can.height || ball.y - ball.radius < 0) {
        ball.velY = -ball.velY;
    }

    let player = (ball.x < can.width / 2) ? user : cpu;

    if (collision(ball, player)) {
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);

        let angleRad = (Math.PI / 4) * collidePoint;

        let direction = (ball.x < can.width / 2) ? 1 : -1;
        ball.velX = direction * ball.speed * Math.cos(angleRad);
        ball.velY = ball.speed * Math.sin(angleRad);

        ball.speed += 0.1;
    }

    if (ball.x - ball.radius < 0) {
        cpu.score++;
        resetBall();
    } else if (ball.x + ball.radius > can.width) {
        user.score++;
        resetBall();
    }

    // Check for game over
    if (user.score === 10 || cpu.score === 10) {
        clearInterval(gameLoop);
        let winner = user.score === 10 ? "User" : "CPU";
        draw.clearRect(0, 0, can.width, can.height);
        draw.fillStyle = "white";
        draw.font = "60px Arial";
        draw.fillText(`${winner} Wins!`, can.width / 4, can.height / 2);
        draw.font = "40px Arial";
        draw.fillText("Congratulations!", can.width / 4, can.height / 2 + 60);
        return;
    }
}

function game() {
    update();
    render();
}

function startGame() {
    if (!gameLoop) {
        gameLoop = setInterval(game, 1000 / 50);
    }
    isGamePaused = false;
}

function pauseGame() {
    isGamePaused = true;
}

function restartGame() {
    clearInterval(gameLoop);
    gameLoop = null;
    isGamePaused = false;

    // Reset scores and positions
    user.score = 0;
    cpu.score = 0;
    user.y = (can.height - 100) / 2;
    cpu.y = (can.height - 100) / 2;
    resetBall();

    // Clear the canvas and redraw the initial state
    draw.clearRect(0, 0, can.width, can.height);
    render();
}

document.addEventListener("keydown", (event) => {
    switch(event.key) {
        case "w":
            user.dy = -8;
            break;
        case "s":
            user.dy = 8;
            break;
        case "ArrowUp":
            cpu.dy = -8;
            break;
        case "ArrowDown":
            cpu.dy = 8;
            break;
    }
});

document.addEventListener("keyup", (event) => {
    switch(event.key) {
        case "w":
        case "s":
            user.dy = 0;
            break;
        case "ArrowUp":
        case "ArrowDown":
            cpu.dy = 0;
            break;
    }
});
