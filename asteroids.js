
//1.Model
let canvas, context, W, H;
let keys = [];
let asteroids = [];
let ship;
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
        this.speed = 0.60;
        this.rotationSpeed = 0.0015;
        this.radius = 20;
        this.angle = 45;
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

    draw() {
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.beginPath();
        let vertAngle = (Math.PI * 2) / 3;
        let radians = this.angle / Math.PI * 180;
        for (let i = 0; i < 3; i++) {
            context.lineTo(
                this.x - this.radius * Math.cos(vertAngle * i + radians),
                this.y - this.radius * Math.sin(vertAngle * i + radians)
            );
        }
        context.closePath();
        context.stroke();
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

class Asteroid {
    constructor() {
        this.radiusMultiplier = 10;
        this.size = getRandomInt(4);
        this.radius = this.radiusMultiplier * this.size;
        //this.strokeStyle = getComputedStyle();
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
    }

    move() {

    }

    draw() {
        context.strokeStyle = this.strokeStyle;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(getRandomInt(W), getRandomInt(H), this.radius, 0, 2 * Math.PI)
        context.stroke();
    }
}


// 2.Desenare
function desenare() {
    // a) stergere scena
    context.fillStyle = "black";
    context.fillRect(0, 0, W, H);

    // b) desenare nava
    ship.draw();
    for (let i = 0; i < 5; i++) {
        asteroids[i] = new Asteroid;
        asteroids[i].draw();
    }

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
    ship.move();

}

function render() {
    desenare();
    ship.move();
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
function aplicatie() {
    //initializare model 
    canvas = document.getElementById('asteroidsCanvas');
    context = canvas.getContext('2d');
    W = canvas.width;
    H = canvas.height;

    ship = new Ship();
    render();
}


document.addEventListener('DOMContentLoaded', aplicatie);