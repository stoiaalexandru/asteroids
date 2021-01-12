
//1.Model

//Numarul de puncte la care se regenereaza o viata
const NEW_LIFE_LIMIT = 500;
//Timpul in care nava este invulnerabila(secunde)
const INVULNERABLE_TIME = 2;
//Framerate
const FPS = 60;
let canvas, context, W, H;
//Vector in care vom retine toate butoanele care sunt apasate la un moment dat
let keys = [];
//Vector in care vom stoca asteroizii
let asteroids = [];
//Vector in care vom stoca rachetele
let rockets = [];
//Nava
let ship;
//Nivelul curent
let level;
//Un flag pentru verificarea necesitatii generarii unui nou nivel
let newLevel;
//Numarul de vieti ramase
let lives;
//Scorul curent
let score;
//In momentul in care acest counter ajunge la valoarea lui NEW_LIFE_LIMIT, aceasta valoare va fi scazuta din acesta, iar o viata va fi regenerata
let newLife;
//Flag pentru a detecta necesitatea ecranului de sfarsit de joc
let isGameOver = false;
//Flag pentru a restarta jocul
let gameRestart = false;
//Flag pentru obiectul de orbita 
let orbit = false;

//Functie pentru obtinerea unui numar intreg aleator
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function angleToRadians(angle) {
    return angle / Math.PI * 180;
}
//Cea mai mica distanta in grade dintre doua unghiuri
function angleDifference(angle1, angle2) {
    return angle = 180 - Math.abs(Math.abs(angle1 - angle2) - 180);
}
//Verificarea intersectiei a doua cercuri
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
//Desenarea scorului
function drawScore() {
    context.fillStyle = 'white';
    context.font = "23px Calibri"
    context.fillText("Score: " + score.toString(), W - 100, H - 50);
}

//Desenarea nivelului curent
function drawLevel() {
    context.fillStyle = 'white';
    context.font = "23px Calibri"
    context.fillText("Level " + level.toString(), W - 50, 25);
}

//Crearea unui nou nivel
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

//Desenarea ecranului de sfarsit de joc
function drawGameOver() {
    context.fillStyle = 'white';
    context.font = "23px Calibri"
    context.fillText("GAME OVER!", W / 2 - 50, H / 2);
    context.fillText("Your final score is: " + score.toString(), W / 2 - 50, H / 2 + 30);
}
//Nava devine invizibila in ecranul de sfarsit de joc
function gameOver() {
    ship.visible = false;
}

//Restartarea jocului
function restartGame() {
    ship = new Ship();
    asteroids = [];
    rockets = [];
    level = 0;
    newLevel = true;
    lives = 3;
    score = 0;
    newLife = 0;
    isGameOver = false;
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
    //Functia de miscare
    move() {

        //Verificarea marginilor canvasului si "teleportarea" in partea opusa a acestuia a navei
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
        //Miscarea propriuzisa
        this.x += this.movementX;
        this.y += this.movementY;

        //DECELERARE
        this.movementX *= 0.92;
        this.movementY *= 0.92;

    }
    //Rotirea navei
    rotate(direction) {
        this.angle += this.rotationSpeed * direction
    }

    //Desenarea razei de coliziune a navei
    drawHitbox() {
        context.beginPath();
        context.arc(this.x, this.y, this.hitboxRadius, 0, Math.PI * 2);
        context.closePath();
        context.strokeStyle = 'red';
        context.stroke();
    }

    //Desenarea navei
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

        //Varful navei
        context.beginPath();
        context.arc(this.tipX, this.tipY, 2, 0, Math.PI * 2);
        context.closePath();
        context.fillStyle = 'red';
        context.fill();
    }


    //Desenarea unui triunghi, functie folosita pentru desenarea vietilor(drawLives)
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

    //Desenarea unui obiect care orbiteaza in jurul navei
    drawOrbit() {
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.beginPath();
        let vertAngle = (Math.PI * 2) / 3;
        let radians = angleToRadians(this.angle);
        context.beginPath();
        for (let i = 0; i < 3; i++) {
            context.lineTo(
                this.x - this.radius * Math.cos(vertAngle * i + radians) / (7 / 3),
                this.y - this.radius * Math.sin(vertAngle * i + radians) / (1 / 3)
            );
        }
        context.closePath();
        context.stroke();
    }


    //Evenimentul produs de coliziunea navei cu un asteroid
    explode() {
        this.x = W / 2;
        this.y = H / 2;
        this.movementX = 0;
        this.movementY = 0;
        lives--;
        this.invulnerable = true;
        this.invulnerableTimer = INVULNERABLE_TIME * FPS;
    }

    //Efect de "blinking" care semnifica invulnerabilitatea, si ,dupa ce trece timpul (invulnerableTimer), nava devine vulnerabila din nou
    isInvulnerable() {
        if (this.invulnerable && this.invulnerableTimer > 0 && this.invulnerableTimer % 15 === 0) {
            this.invulnerableTimer--;
            this.visible = true;
        }
        else if (this.invulnerable && this.invulnerableTimer > 0 && this.invulnerableTimer % 15 !== 0) {
            this.invulnerableTimer--;
            this.visible = false;
        }
        else if (this.invulnerableTimer != -100) {
            this.invulnerable = false;
            this.visible = true;
        }
    }

    keyListener() {
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

    //Miscarea unui asteroid
    move() {
        //miscarea propriuzisa
        this.x += Math.cos(angleToRadians(this.angle)) * this.speed
        this.y += Math.sin(angleToRadians(this.angle)) * this.speed

        //Verificarea marginilor canvasului si "teleportarea" in partea opusa a acestuia a asteroidului
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
        //Schimbarea culorii in functie de dimensiunea asteroidului
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
        //Desenarea asteroidului
        context.strokeStyle = this.strokeStyle;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        context.stroke();

        //Desenarea marimii
        context.fillStyle = this.strokeStyle;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = "23px Calibri"
        context.fillText(this.size.toString(), this.x, this.y);
    }

    //Popularea vectorului asteroids[] cu asteroizi, numarul acestora depinzand de nivelul curent
    static createAsteroids(levelMultiplier) {
        for (let i = asteroids.length; i < 3 * levelMultiplier; i++) {
            let newAsteroid = new Asteroid();
            asteroids[i] = newAsteroid;
            //  asteroids[i].draw();
        }
        newLevel = false;
    }

    //Redesenarea asteroizilor (+testarea coliziunilor)
    static redrawAsteroids() {
        for (let i = 0; i < asteroids.length; i++) {

            if (asteroids[i].size > 0) {
                asteroids[i].draw();
            }
            asteroids[i].shipCollision();
            asteroids[i].rocketCollision();
        }
    }

    //Tratarea ciocnirii a doi asteroizi
    static AsteroidCollision() {
        loop1:
        for (let i = 0; i < asteroids.length - 1; i++) {
            for (let j = i + 1; j < asteroids.length; j++) {
                if (collisionDetection(asteroids[i].x, asteroids[i].y, asteroids[i].radius,
                    asteroids[j].x, asteroids[j].y, asteroids[j].radius)) {
                    let aux = asteroids[i].angle;
                    asteroids[i].angle = asteroids[j].angle;
                    asteroids[j].angle = aux;
                    break loop1;
                }
            }
        }
    }

    //Eliminarea asteroizilor cu marimea 0 din vectorul asteroids[]
    static clearAsteroidArray() {
        for (let i = 0; i < asteroids.length; i++) {
            if (asteroids[i].size <= 0) {
                asteroids.splice(i, 1);
            }
        }
    }

    //Tratarea ciocnirii unei rachete cu un asteroid
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


    //Tratarea evenimentului de coliziune intre nava si un asteroid
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
    //Miscarea rachetei
    move() {
        this.x -= Math.cos(angleToRadians(this.angle)) * this.speed;
        this.y -= Math.sin(angleToRadians(this.angle)) * this.speed;


    }
    //Desenare sub forma de dreptunghi (nu a mai fost folosita ulterior)
    drawAsRectangle() {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    //Desenare sub forma de cerc
    drawAsCircle() {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }

    //Redesenarea rachetelor (si eliminarea lor in cazul in care depasesc marginea canvasului)
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
    // Stergerea scenei curente
    context.fillStyle = "black";
    context.fillRect(0, 0, W, H);
    // Desenare layout
    ship.drawLives();
    if (!isGameOver) {
        drawScore();
        drawLevel();

        // Desenarea navei
        if (ship.visible) {
            ship.draw();
            if (ship.hitboxVisible) {
                ship.drawHitbox();
            }
            if (orbit) {
                ship.drawOrbit();
            }
        }
    }
    //Desenarea ecranului de final(daca este cazul)
    else {
        drawGameOver();
    }
    // Redesenarea asteroizilor
    Asteroid.redrawAsteroids();
    // Redesenarea rachetelor
    Rocket.redrawRockets();
}

//3. Actualizare model 
function actualizare() {
    if (gameRestart) {
        restartGame();
        gameRestart = false;
    }
    if (asteroids.length === 0 || newLevel===true) {
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
    ship.keyListener();
    requestAnimationFrame(actualizare);

}


// 4. Tratare evenimente
document.addEventListener("keydown", (ev) => {
    keys[ev.key] = true;
})
document.addEventListener("keyup", (ev) => {
    keys[ev.key] = false;
})
document.getElementById("restartGame").addEventListener("click", () => {
    gameRestart = true;
});
document.getElementById("hitbox").addEventListener("click", () => {
    if (ship.hitboxVisible) {
        ship.hitboxVisible = false;
    }
    else {
        ship.hitboxVisible = true;
    }
});
document.getElementById("invulnerable").addEventListener("click", function () {
    if (ship.invulnerable) {
        ship.invulnerable = false;
    }
    else {
        ship.invulnerable = true;
        ship.invulnerableTimer = -100;
    }
});
document.getElementById("orbit").addEventListener("click", () => {
    if (!orbit) {
        orbit = true;
    }
    else {
        orbit = false;
    }
});
document.getElementById("increaseLevel").addEventListener("click", () => {
    newLevel=true;
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
    actualizare();
}


document.addEventListener('DOMContentLoaded', aplicatie);