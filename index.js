const LANDING_PROBABILITY = 0.005;
const FLYING_PROBABILITY = 0.0005;

// Set up canvas
const canvas = document.getElementById("boidsCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// Create a population of boids
const boids = [];
let cursor = { x: 0, y: 0 };

// const landingPoints = []
const landingPoints = [
    {x: 732, y: 445 },
    {x: 758, y: 460 },
    {x: 771, y: 456 },
    {x: 784, y: 460 },
    {x: 804, y: 460 },
    {x: 816, y: 456 },
    {x: 828, y: 460 },
    {x: 847, y: 439 },
    {x: 872, y: 460 },
    {x: 919, y: 446 },
    {x: 944, y: 460 },
    {x: 957, y: 456 },
    {x: 970, y: 460 },
    {x: 989, y: 455 },
    {x: 1005, y: 458 },
    {x: 1023, y: 458 },
    {x: 1053, y: 458 },
    {x: 1074, y: 440 },
    {x: 1096, y: 460 },
    {x: 1106, y: 456 },
    {x: 1117, y: 460 }
]

const birdImageRight = new Image();
birdImageRight.src = "birdRight.png";
const birdImageLeft = new Image();
birdImageLeft.src = "birdLeft.png";
const birdImageIdle = new Image();
birdImageIdle.src = "birdIdle.png";

const BIRD_FRAMES = 7;
const BIRD_FRAMERATE = 6;
const BIRD_IDLE_FRAMES = 8;
const BIRD_IDLE_FRAMERATE = 15;

// for (let i=0; i<30; i++) {
//     landingPoints.push({x: 400+i*15, y: 400});
// }



canvas.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX;
    cursor.y = event.clientY;
  });


// window.addEventListener('click', (event) => {
//     console.log("{x: "+event.clientX+", y: "+event.clientY+" }, ")
// });

window.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
}, false);


for (let i = 0; i < 50; i++) {
  boids.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height));
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctx.fillStyle = "black";
    // ctx.fillRect(400, 395, 450, 10);

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
                landingPoints.push(boid.landingPoint);
                console.log(landingPoints.length)
                boid.takeOff();
            }
        }
        boid.render();
    });

    requestAnimationFrame(animate);
}

animate();