
//1.Model
const NEW_LIFE_LIMIT = 500;
const INVULNERABLE_TIME = 2;
const FPS = 60;
let canvas, context, W, H;
let keys = [];
let asteroids = [];
let rockets = [];
let ship;
let level;
let newLevel;
let lives;
let score;
let newLife;
let isGameOver = false;
let gameRestart= false;
let orbit=false;


function angleToRadians(angle) {
    return angle / Math.PI * 180;
}
function angleDifference(angle1, angle2) {
    return angle = 180 - Math.abs(Math.abs(angle1 - angle2) - 180);
}
function collisionDetection(x1, y1, r1, x2, y2, r2) {

    var a;
    var x;
    var y;

    a = r1 + r2;
    x = x1 - x2;
    y = y1 - y2;

    if (a > Math.sqrt((x * x) + (y * y))) {
        return true;
    } else {
        return false;
    }
}

function drawScore() {
    context.fillStyle = 'white';
    context.font = "23px Calibri"
    context.fillText("Score: " + score.toString(), W - 100, H - 50);
}

function drawLevel() {
    context.fillStyle = 'white';
    context.font = "23px Calibri"
    context.fillText("Level " + level.toString(), W - 50, 25);
}

function createNewLevel() {
    newLevel = true;
    level++;
    ship.x = W / 2;
    ship.y = H / 2;
    ship.movementX = 0;
    ship.movementY = 0;
    ship.invulnerable = true;
    ship.invulnerableTimer = INVULNERABLE_TIME * FPS;
    Asteroid.createAsteroids(level);


}
function drawGameOver() {
    context.fillStyle = 'white';
    context.font = "23px Calibri"
    context.fillText("GAME OVER!", W / 2 - 50, H / 2);
}

function gameOver() {
    ship.visible = false;
}

function restartGame(){
    ship=new Ship();
    asteroids=[];
    rockets=[];
    level = 0;
    newLevel = true;
    lives = 3;
    score = 0;
    newLife = 0;
    isGameOver=false;
    createNewLevel(0);

}

class Ship {

    constructor() {
        this.x = W / 2;
        this.y = H / 2;
        this.visible = true;
        this.movingUp = false;
        this.movingLeft = false;
        this.movingRight = false;
        this.movingDown = false;
        this.movementX = 0;
        this.movementY = 0;
        this.speed = 0.8;
        this.rotationSpeed = 0.0015;
        this.radius = 20;
        this.hitboxRadius = 18;
        this.angle = 0;
        this.tipX = W / 2 + this.radius
        this.tipY = H / 2
        this.invulnerable = true;
        this.invulnerableTimer = INVULNERABLE_TIME * FPS;
        this.hitboxVisible = false;
    }

    move() {

        if (this.movingUp) {
            this.movementY -= this.speed;
        }
        if (this.movingDown) {
            this.movementY += this.speed;
        }
        if (this.movingLeft) {
            this.movementX -= this.speed;
        }
        if (this.movingRight) {
            this.movementX += this.speed;
        }
        if (this.x < this.radius) {
            this.x = W;
        }
        if (this.x > W) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = H;
        }
        if (this.y > H) {
            this.y = this.radius;
        }

        this.x += this.movementX;
        this.y += this.movementY;

        //DECELERATION
        this.movementX *= 0.92;
        this.movementY *= 0.92;

    }

    rotate(direction) {
        this.angle += this.rotationSpeed * direction
    }

    drawHitbox() {
        context.beginPath();
        context.arc(this.x, this.y, this.hitboxRadius, 0, Math.PI * 2);
        context.closePath();
        context.strokeStyle = 'red';
        context.stroke();
    }

    draw() {
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.beginPath();
        let vertAngle = (Math.PI * 2) / 3;
        let radians = angleToRadians(this.angle);
        this.tipX = this.x - this.radius * Math.cos(radians);
        this.tipY = this.y - this.radius * Math.sin(radians);
        for (let i = 0; i < 3; i++) {
            context.lineTo(
                this.x - this.radius * Math.cos(vertAngle * i + radians),
                this.y - this.radius * Math.sin(vertAngle * i + radians)
            );
        }
        context.closePath();
        context.stroke();

        //SHIP TIP
        context.beginPath();
        context.arc(this.tipX, this.tipY, 2, 0, Math.PI * 2);
        context.closePath();
        context.fillStyle = 'red';
        context.fill();

       


    }


    drawTriangle(x, y, a, colour = 'white') {
        context.strokeStyle = colour;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo( // nose of the ship
            x + 2 / 3 * ship.radius * Math.cos(a),
            y - 2 / 3 * ship.radius * Math.sin(a)
        );
        context.lineTo( // rear left
            x - ship.radius * (2 / 3 * Math.cos(a) + Math.sin(a)),
            y + ship.radius * (2 / 3 * Math.sin(a) - Math.cos(a))
        );
        context.lineTo( // rear right
            x - ship.radius * (2 / 3 * Math.cos(a) - Math.sin(a)),
            y + ship.radius * (2 / 3 * Math.sin(a) + Math.cos(a))
        );
        context.closePath();
        context.stroke();
    }

    drawLives() {
        for (let i = 0; i < lives; i++) {
            this.drawTriangle(this.radius + i * this.radius * 2.3, this.radius, 0.5 * Math.PI);
        }
    }

    drawOrbit(){
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.beginPath();
        let vertAngle = (Math.PI * 2) / 3;
        let radians = angleToRadians(this.angle);
        context.beginPath();
        for (let i = 0; i < 3; i++) {
            context.lineTo(
                this.x - this.radius * Math.cos(vertAngle * i + radians)/(7/3),
                this.y - this.radius * Math.sin(vertAngle * i + radians)/(1/3)
            );
        }
        context.closePath();
        context.stroke();
    }



    explode() {
        this.x = W / 2;
        this.y = H / 2;
        this.movementX = 0;
        this.movementY = 0;
        lives--;
        this.invulnerable = true;
        this.invulnerableTimer = INVULNERABLE_TIME * FPS;
    }

    isInvulnerable() {
        if (this.invulnerable && this.invulnerableTimer > 0 && this.invulnerableTimer % 15 === 0) {
            this.invulnerableTimer--;
            this.visible = true;
        }
        else if (this.invulnerable && this.invulnerableTimer > 0 && this.invulnerableTimer % 15 !== 0) {
            this.invulnerableTimer--;
            this.visible = false;
        }
        else if(this.invulnerableTimer!=-100) {
            this.invulnerable = false;
            this.visible = true;
        }
    }



}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

class Asteroid {
    constructor() {
        this.radiusMultiplier = 10;
        this.size = 1 + getRandomInt(4);
        this.radius = this.radiusMultiplier * this.size;
        this.x = getRandomInt(W);
        this.y = getRandomInt(H);
        this.angle = getRandomInt(359);
        this.speed = 1 + Math.random() * 4;
        this.strokeStyle = 'white'

    }

    move() {
        this.x += Math.cos(angleToRadians(this.angle)) * this.speed
        this.y += Math.sin(angleToRadians(this.angle)) * this.speed
        if (this.x < this.radius) {
            this.x = W;
        }
        if (this.x > W) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = H;
        }
        if (this.y > H) {
            this.y = this.radius;
        }

    }

    draw() {

        switch (this.size) {
            case 1: {
                this.strokeStyle = "red";
                break;
            }
            case 2: {
                this.strokeStyle = "yellow";
                break;
            }
            case 3: {
                this.strokeStyle = "green";
                break;
            }
            case 4: {
                this.strokeStyle = "blue";
                break;
            }

        }

        context.strokeStyle = this.strokeStyle;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        context.stroke();

        //ToDo: draw SIZE
        context.fillStyle = this.strokeStyle;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = "23px Calibri"
        context.fillText(this.size.toString(), this.x, this.y);
    }

    static createAsteroids(levelMultiplier) {
        for (let i = asteroids.length; i < 3 * levelMultiplier; i++) {
            let newAsteroid = new Asteroid();
            asteroids[i] = newAsteroid;
            asteroids[i].draw();
        }
        newLevel = false;
    }
    static redrawAsteroids() {
        for (let i = 0; i < asteroids.length; i++) {

            if (asteroids[i].size > 0) {
                asteroids[i].draw();
            }
            asteroids[i].shipCollision();
            asteroids[i].rocketCollision();
        }
    }
    static AsteroidCollision() {
        loop1:
        for (let i = 0; i < asteroids.length - 1; i++) {
            for (let j = i + 1; j < asteroids.length; j++) {
                if (collisionDetection(asteroids[i].x, asteroids[i].y, asteroids[i].radius,
                    asteroids[j].x, asteroids[j].y, asteroids[j].radius)) {
                    // if (angleDifference(asteroids[i].angle, asteroids[j].angle) > 15) {
                    let aux = asteroids[i].angle;
                    asteroids[i].angle = asteroids[j].angle;
                    asteroids[j].angle = aux;
                    //}
                    // else if(asteroids[i].angle>180){
                    //     asteroids[i].angle-=180;
                    // }
                    // else {
                    //     asteroids[i].angle+=180;
                    // }
                    // break loop1;
                }
            }
        }
    }

    static clearAsteroidArray() {
        for (let i = 0; i < asteroids.length; i++) {
            if (asteroids[i].size <= 0) {
                asteroids.splice(i, 1);
            }
        }
    }
    rocketCollision() {
        for (let i = 0; i < rockets.length; i++) {
            if (collisionDetection(rockets[i].x, rockets[i].y, rockets[i].radius, this.x, this.y, this.radius)) {
                score += 150 / this.size;
                newLife += 150 / this.size;
                this.size--;
                this.radius = this.radiusMultiplier * this.size;
                rockets.splice(i, 1);
                if (newLife >= NEW_LIFE_LIMIT) {
                    if (lives < 3) {
                        lives++;
                    }
                    newLife -= NEW_LIFE_LIMIT;
                }
            }
        }
        Asteroid.clearAsteroidArray();
    }



    shipCollision() {
        if (collisionDetection(this.x, this.y, this.radius, ship.x, ship.y, ship.hitboxRadius)) {
            if (!ship.invulnerable) {
                ship.explode();
            }
        }

    }
}

class Rocket {
    constructor(angle) {
        this.x = ship.tipX;
        this.y = ship.tipY;
        this.angle = angle;
        this.height = 3;
        this.width = 3;
        this.speed = 6;
        this.radius = 2;
        this.movementX = 0;
        this.movementY = 0;

    }

    move() {
        this.x -= Math.cos(angleToRadians(this.angle)) * this.speed;
        this.y -= Math.sin(angleToRadians(this.angle)) * this.speed;


    }

    drawAsRectangle() {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    drawAsCircle() {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }

    static redrawRockets() {

        for (let i = 0; i < rockets.length; i++) {
            if (rockets[i].x < 0 || rockets[i].x > W || rockets[i].y < 0 || rockets[i].y > H) {
                rockets.splice(i, 1);
            }
        }
        for (let i = 0; i < rockets.length; i++) {
            rockets[i].drawAsCircle();
        }
    }
}


// 2.Desenare
function desenare() {
    // a) stergere scena
    context.fillStyle = "black";
    context.fillRect(0, 0, W, H);
    // b) desenare layout
    ship.drawLives();
    if (!isGameOver) {
        drawScore();
        drawLevel();

        // c) desenare nava
        if (ship.visible) {
            ship.draw();
            if (ship.hitboxVisible) {
                ship.drawHitbox();
            }
            if(orbit){
                ship.drawOrbit();
            }
        }
    }
    else {
        drawGameOver();
    }
    // d) desenare asteroizi
    Asteroid.redrawAsteroids();
    // e)redesenare rachete
    Rocket.redrawRockets();


}

//3. Actualizare model 
function actualizare() {
    ship.movingDown = (keys["ArrowDown"])
    ship.movingUp = (keys["ArrowUp"])
    ship.movingLeft = (keys["ArrowLeft"])
    ship.movingRight = (keys["ArrowRight"])
    if (keys["z"] || keys["Z"]) {
        ship.rotate(-1);
    }
    if (keys["c"] || keys["C"]) {
        ship.rotate(1);
    }
    if (keys["x"] || keys["X"]) {
        if (rockets.length < 3) {
            rockets.push(new Rocket(ship.angle));

        }
        keys["x"] = false;
        keys["X"] = false;
    }


}

function render() {
    if(gameRestart){
        restartGame();
        gameRestart=false;
    }
    if (asteroids.length === 0) {
        createNewLevel();
    }
    if (lives <= 0) {
        isGameOver = true;
    }

    desenare();
    ship.isInvulnerable();

    ship.move();
    for (let asteroid of asteroids) {
        asteroid.move();
    }
    Asteroid.AsteroidCollision();
    for (let rocket of rockets) {
        rocket.move();
    }
    actualizare();
    requestAnimationFrame(render);
}
// 4. Tratare evenimente
document.addEventListener("keydown", (ev) => {
    keys[ev.key] = true;
})

document.addEventListener("keyup", (ev) => {
    keys[ev.key] = false;
})

document.getElementById("restartGame").addEventListener("click", () =>{
    gameRestart=true;
});

document.getElementById("hitbox").addEventListener("click", () =>{
    if(ship.hitboxVisible){
        ship.hitboxVisible=false;
    }
    else {
        ship.hitboxVisible=true;
    }
});
document.getElementById("invulnerable").addEventListener("click", function () {
    if (ship.invulnerable) {
        ship.invulnerable = false;
    }
    else { 
        ship.invulnerable = true;
        ship.invulnerableTimer=-100;
     }
});

document.getElementById("orbit").addEventListener("click", () =>{
    if(!orbit){
        orbit=true;
    }
    else {
        orbit=false;
    }
});


function aplicatie() {
    //initializare model 
    canvas = document.getElementById('asteroidsCanvas');
    context = canvas.getContext('2d');
    W = canvas.width;
    H = canvas.height;
    level = 0;
    newLevel = true;
    lives = 3;
    score = 0;
    newLife = 0;
    ship = new Ship();

    render();
}


document.addEventListener('DOMContentLoaded', aplicatie);