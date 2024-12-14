const canvas = document.getElementById("boidsCanvas");
const ctx = canvas.getContext("2d");

let cursor = { x: 0, y: 0 };
canvas.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX;
    cursor.y = event.clientY;
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);


const redSpriteSet = {}
redSpriteSet.right = new Image();
redSpriteSet.right.src = "sprites/birdRightRed.png";
redSpriteSet.left = new Image();
redSpriteSet.left.src = "sprites/birdLeftRed.png";
redSpriteSet.idle = new Image();
redSpriteSet.idle.src = "sprites/birdIdleRed.png";

const greenSpriteSet = {}
greenSpriteSet.right = new Image();
greenSpriteSet.right.src = "sprites/birdRightGreen.png";
greenSpriteSet.left = new Image();
greenSpriteSet.left.src = "sprites/birdLeftGreen.png";
greenSpriteSet.idle = new Image();
greenSpriteSet.idle.src = "sprites/birdIdleGreen.png";

const blueSpriteSet = {}
blueSpriteSet.right = new Image();
blueSpriteSet.right.src = "sprites/birdRightBlue.png";
blueSpriteSet.left = new Image();
blueSpriteSet.left.src = "sprites/birdLeftBlue.png";
blueSpriteSet.idle = new Image();
blueSpriteSet.idle.src = "sprites/birdIdleBlue.png";

const orangeSpriteSet = {}
orangeSpriteSet.right = new Image();
orangeSpriteSet.right.src = "sprites/birdRightOrange.png";
orangeSpriteSet.left = new Image();
orangeSpriteSet.left.src = "sprites/birdLeftOrange.png";
orangeSpriteSet.idle = new Image();
orangeSpriteSet.idle.src = "sprites/birdIdleOrange.png";

const pinkSpriteSet = {}
pinkSpriteSet.right = new Image();
pinkSpriteSet.right.src = "sprites/birdRightPink.png";
pinkSpriteSet.left = new Image();
pinkSpriteSet.left.src = "sprites/birdLeftPink.png";
pinkSpriteSet.idle = new Image();
pinkSpriteSet.idle.src = "sprites/birdIdlePink.png";


spriteSets = [redSpriteSet, greenSpriteSet, blueSpriteSet, orangeSpriteSet, pinkSpriteSet]


function makeBranch(x, y, width, height) {
    branches.push({x: x, y:y, width:width, height:height});
    for (let i=x+10; i<x+width; i+=20) {
        landingPoints.push({x: i, y: y+5});
    }
}

landingPoints = []
branches = []

makeBranch(canvas.width/6, canvas.height/4, canvas.width/2, 10);
makeBranch(canvas.width*2/6, canvas.height/2, canvas.width/2, 10);
makeBranch(canvas.width/6, canvas.height*3/4, canvas.width/2, 10);



boids = [];

for (let i = 0; i < 100; i++) {
    boids.push(new Boid(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        spriteSets[Math.floor(Math.random() * spriteSets.length)]
    ));
}



function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    branches.forEach(branch => {
        ctx.fillStyle = "black";
        ctx.fillRect(branch.x, branch.y, branch.width, branch.height);
    })
        
    boids.forEach(boid => {
        if (boid.state == "flying") {
            boid.flock(boids);
            boid.update();
            boid.edges();
        } else if (boid.state == "landing") {
            boid.land();
            boid.update();
            boid.edges();
        } else {
            const cursorDist = Math.sqrt(
                (boid.position.x - cursor.x) ** 2 + (boid.position.y - cursor.y) ** 2
            );
            if (Math.random() < FLYING_PROBABILITY || cursorDist < 50) {
                boid.lifespan = Math.random()*500+300;
                boid.takeOff();
            }
        }
        boid.render();
    });

    requestAnimationFrame(this.animate);
}
animate();

