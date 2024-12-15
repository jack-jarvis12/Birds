const SEPARATION_WEIGHT = 3.0;
const ALIGNMENT_WEIGHT = 1.0;  
const COHESION_WEIGHT = 1.0;   

const CURSOR_FORCE_WEIGHT = 0.5;

const ALIGNMENT_DISTANCE = 200;
const COHESION_DISTANCE = 200;

const BIRD_FRAMES = 7;
const BIRD_FRAMERATE = 6;
const BIRD_IDLE_FRAMES = 8;
const BIRD_IDLE_FRAMERATE = 15;

const LANDING_PROBABILITY = 0.005;
const FLYING_PROBABILITY = 0.0005;

const MARGIN = 150;

class Boid {
    constructor(x, y, spriteSet) {
        this.position = { x, y };
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.acceleration = { x: 0, y: 0 };
        this.maxSpeed = Math.random()*2+1;
        this.maxForce = Math.random()*0.02+0.03;
        this.size = 5;
        this.state = "flying";
        this.lifespan = 0;
        this.landingPoint = null;
        this.frame = Math.random()*BIRD_FRAMES*BIRD_FRAMERATE;
        this.spriteSet = spriteSet;
    }
  
    // Update boid's position and velocity
    update() {
        const cursorForce = this.avoidCursor();
        this.applyForce({
            x: cursorForce.x * CURSOR_FORCE_WEIGHT,
            y: cursorForce.y * CURSOR_FORCE_WEIGHT
        })


        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
    
        // Limit speed
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > this.maxSpeed) {
            const scale = this.maxSpeed / speed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }
    
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    
        // Reset acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        this.lifespan -= 1;
        if (this.lifespan <= 0 && this.state == "flying" && landingPoints.length > 0) {
            const randomIndex = Math.floor(Math.random() * landingPoints.length);
            this.landingPoint = landingPoints[randomIndex];
            landingPoints.splice(randomIndex, 1);
            this.state = "landing";
        }
    }

    land() {
        const distance = Math.sqrt(
            (this.position.x - this.landingPoint.x) ** 2 + 
            (this.position.y - this.landingPoint.y) ** 2
        );
        
        
        if (distance <= 3) {
            this.state = "landed";
            this.velocity = {x: 0, y: 0};
            this.acceleration = {x: 0, y: 0};
        } else {
            var desired = {
                x: this.landingPoint.x - this.position.x,
                y: this.landingPoint.y - this.position.y
            };

            const desiredLength = Math.sqrt(desired.x ** 2 + desired.y ** 2);

            desired.x /= desiredLength;
            desired.y /= desiredLength;
            desired.x *= this.maxSpeed;
            desired.y *= this.maxSpeed;

            desired = this.lerp(this.velocity, desired, 0.01);

            const steer = {
                x: desired.x - this.velocity.x,
                y: desired.y - this.velocity.y
            };

            const steerLength = Math.sqrt(steer.x ** 2 + steer.y ** 2);
            if (steerLength > this.maxForce) {
                steer.x *= this.maxForce / steerLength;
                steer.y *= this.maxForce / steerLength;
            }
            this.applyForce(steer);
        }
    }

    takeOff(){
        this.state = "flying";
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        landingPoints.push(this.landingPoint);
        this.landingPoint = null;
    }
  
    // Apply force to the boid
    applyForce(force) {
        this.acceleration.x += force.x;
        this.acceleration.y += force.y;
    }

    lerp(force1, force2, factor) {
        return {x: (1-factor)*force1.x + factor*force2.x, y: (1-factor)*force1.y + factor*force2.y};
    }
  
    // Render the boid on the canvas
    render() {

        if (this.state == "landed") {
            ctx.drawImage(this.spriteSet.idle, 0, Math.floor(this.frame/BIRD_IDLE_FRAMERATE)*32, 32, 32, this.position.x-18, this.position.y-35, 38, 38);
            this.frame += 1;
            if (this.frame > BIRD_IDLE_FRAMERATE*(BIRD_IDLE_FRAMES-1)) {
                this.frame = 0;
            }
        } else {
            if (this.velocity.x >= 0) {
                ctx.drawImage(this.spriteSet.right, 0, Math.floor(this.frame/BIRD_FRAMERATE)*600, 800, 600, this.position.x-20, this.position.y-35, 50, 50);
            }  else {
                ctx.drawImage(this.spriteSet.left, 0, Math.floor(this.frame/BIRD_FRAMERATE)*600, 800, 600, this.position.x-30, this.position.y-35, 50, 50);
            }
            this.frame += 1;
            if (this.frame > BIRD_FRAMERATE*(BIRD_FRAMES-1)) {
                this.frame = 0;
            }
        }

    }
  
    // Check if boid is near the edges 
    edges() {
        if (this.position.x > canvas.width-MARGIN) {
            // this.position.x = 0;
            this.applyForce({x: -this.maxForce, y: 0});
        }
        if (this.position.x < MARGIN) {
            // this.position.x = canvas.width;
            this.applyForce({x: this.maxForce, y: 0});
        }
        if (this.position.y > canvas.height-MARGIN) {
            // this.position.y = 0;
            this.applyForce({x: 0, y: -this.maxForce});
        }
        if (this.position.y < MARGIN) {
            // this.position.y = canvas.height;
            this.applyForce({x: 0, y: this.maxForce});
        }
    }
  
    // Compute steering force for separation
    separate(boids) {
        const desiredSeparation = 40;
        let steer = { x: 0, y: 0 };
        let count = 0;
    
        boids.forEach(boid => {
            if (boid.state == "flying") {
                const dist = Math.sqrt(
                (this.position.x - boid.position.x) ** 2 +
                (this.position.y - boid.position.y) ** 2
                );
                if (dist > 0 && dist < desiredSeparation) {
                const diff = {
                    x: this.position.x - boid.position.x,
                    y: this.position.y - boid.position.y
                };
                const length = Math.sqrt(diff.x ** 2 + diff.y ** 2);
                diff.x /= length;
                diff.y /= length;
        
                steer.x += diff.x;
                steer.y += diff.y;
                count++;
                }
            }
        });
  
        if (count > 0) {
            steer.x /= count;
            steer.y /= count;
            const length = Math.sqrt(steer.x ** 2 + steer.y ** 2);
            if (length > 0) {
            steer.x /= length;
            steer.y /= length;
            steer.x *= this.maxSpeed;
            steer.y *= this.maxSpeed;
            }
            steer.x -= this.velocity.x;
            steer.y -= this.velocity.y;
    
            const lengthSteer = Math.sqrt(steer.x ** 2 + steer.y ** 2);
            if (lengthSteer > this.maxForce) {
            steer.x *= this.maxForce / lengthSteer;
            steer.y *= this.maxForce / lengthSteer;
            }
        }
        return steer;
    }
  
    // Compute steering force for alignment
    align(boids) {
        let sum = { x: 0, y: 0 };
        let count = 0;
    
        boids.forEach(boid => {
            if (boid.state == "flying") {
                const dist = Math.sqrt(
                (this.position.x - boid.position.x) ** 2 +
                (this.position.y - boid.position.y) ** 2
                );
                if (dist > 0 && dist < ALIGNMENT_DISTANCE) {
                sum.x += boid.velocity.x;
                sum.y += boid.velocity.y;
                count++;
                }
            }
        });
    
        if (count > 0) {
            sum.x /= count;
            sum.y /= count;
            const length = Math.sqrt(sum.x ** 2 + sum.y ** 2);
            if (length > 0) {
            sum.x /= length;
            sum.y /= length;
            sum.x *= this.maxSpeed;
            sum.y *= this.maxSpeed;
            }
            sum.x -= this.velocity.x;
            sum.y -= this.velocity.y;
    
            const lengthSteer = Math.sqrt(sum.x ** 2 + sum.y ** 2);
            if (lengthSteer > this.maxForce) {
            sum.x *= this.maxForce / lengthSteer;
            sum.y *= this.maxForce / lengthSteer;
            }
        }
        return sum;
    }
  
    // Compute steering force for cohesion
    cohesion(boids) {
        let sum = { x: 0, y: 0 };
        let count = 0;
    
        boids.forEach(boid => {
            if (boid.state == "flying") {
                const dist = Math.sqrt(
                (this.position.x - boid.position.x) ** 2 +
                (this.position.y - boid.position.y) ** 2
                );
                if (dist > 0 && dist < COHESION_DISTANCE) {
                sum.x += boid.position.x;
                sum.y += boid.position.y;
                count++;
                }
            }
        });
    
        if (count > 0) {
            sum.x /= count;
            sum.y /= count;
            sum.x -= this.position.x;
            sum.y -= this.position.y;
            const length = Math.sqrt(sum.x ** 2 + sum.y ** 2);
            if (length > 0) {
            sum.x /= length;
            sum.y /= length;
            sum.x *= this.maxSpeed;
            sum.y *= this.maxSpeed;
            }
            sum.x -= this.velocity.x;
            sum.y -= this.velocity.y;
    
            const lengthSteer = Math.sqrt(sum.x ** 2 + sum.y ** 2);
            if (lengthSteer > this.maxForce) {
            sum.x *= this.maxForce / lengthSteer;
            sum.y *= this.maxForce / lengthSteer;
            }
        }
        return sum;
    }

    avoidCursor() {
        let repelForce = {x: 0, y: 0};
        const dist = Math.sqrt(
            (this.position.x - cursor.x) ** 2 + (this.position.y - cursor.y) ** 2
        );

        if (dist < 100) {  // Threshold distance for spooking
            
            repelForce.x = (this.position.x - cursor.x) / dist,
            repelForce.y = (this.position.y - cursor.y) / dist
      
            // Make the repelling force stronger as it gets closer
            const scale = 1 - dist / 100;
            repelForce.x *= scale;
            repelForce.y *= scale;
    
        }

        return repelForce;
    }
  
    // Combine all the behaviors
    flock(boids) {
      const separation = this.separate(boids);
      const alignment = this.align(boids);
      const cohesion = this.cohesion(boids);
  
      this.applyForce({
        x: separation.x * SEPARATION_WEIGHT,
        y: separation.y * SEPARATION_WEIGHT
      });
      console.log(alignment);
      this.applyForce({
        x: alignment.x * ALIGNMENT_WEIGHT,
        y: alignment.y * ALIGNMENT_WEIGHT
      });
      this.applyForce({
        x: cohesion.x * COHESION_WEIGHT,
        y: cohesion.y * COHESION_WEIGHT
      });

    }
  }