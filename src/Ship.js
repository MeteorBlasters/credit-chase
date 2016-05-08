// import Bullet from './Bullet';
import Particle from './Particle';
import { rotatePoint, randomNumBetween } from './helpers';

export default class Ship {
  constructor(args) {
    this.position = args.position
    this.velocity = {
      x: 0,
      y: 0
    }
    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.99;
    this.radius = 40;
    this.lastShot = 0;
    this.create = args.create;
    this.onDie = args.onDie;
    this.getSpeedMultiplier = args.getSpeedMultiplier;

    this.img = new Image();   // Create new img element
    this.img.src = '/static/tu_character_logo.svg'; // Set source path
  }

  destroy(){
    this.delete = true;
    this.onDie();

    // Explode
    for (let i = 0; i < 60; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 4),
        position: {
          x: this.position.x + randomNumBetween(-this.radius/4, this.radius/4),
          y: this.position.y + randomNumBetween(-this.radius/4, this.radius/4)
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        }
      });
      this.create(particle, 'particles');
    }
  }

  rotate(dir){
    if (dir == 'LEFT') {
      this.rotation -= this.rotationSpeed;
    }
    if (dir == 'RIGHT') {
      this.rotation += this.rotationSpeed;
    }
  }

  accelerate(val){
    this.velocity.x -= Math.sin(-this.rotation*Math.PI/180) * 0.06//this.speed;
    this.velocity.y -= Math.cos(-this.rotation*Math.PI/180) * 0.06//this.speed;

    // Thruster particles
    let posDelta = rotatePoint({x:0, y:-this.radius*.9}, {x:0,y:0}, (this.rotation-180) * Math.PI / 180);
    const particle = new Particle({
      lifeSpan: randomNumBetween(10, 30),
      size: randomNumBetween(3, 6),
      position: {
        x: this.position.x + posDelta.x + randomNumBetween(-2, 2),
        y: this.position.y + posDelta.y + randomNumBetween(-2, 2)
      },
      velocity: {
        x: posDelta.x / randomNumBetween(3, 5),
        y: posDelta.y / randomNumBetween(3, 5)
      }
    });
    this.create(particle, 'particles');
  }

  render(state){
    //could mess with this more to speed up based on credit score 
    //this.speed = this.getSpeedMultiplier()*.15;
    
    // Controls
    if(state.keys.up){
      this.accelerate(0.5);
    }
    if(state.keys.left){
      this.rotate('LEFT');
    }
    if(state.keys.right){
      this.rotate('RIGHT');
    }
    // if(state.keys.space && Date.now() - this.lastShot > 300){
    //   const bullet = new Bullet({ship: this});
    //   this.create(bullet, 'bullets');
    //   this.lastShot = Date.now();
    // }

    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Rotation
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    // Screen edges
    if(this.position.x > state.screen.width) this.position.x = 0;
    else if(this.position.x < 0) this.position.x = state.screen.width;
    if(this.position.y > state.screen.height) this.position.y = 0;
    else if(this.position.y < 0) this.position.y = state.screen.height;

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.strokeStyle = '#AAA';
    context.fillStyle = '#FFF';
    // context.lineWidth = 2;
    // context.beginPath();
    // context.moveTo(0, -15);
    // context.lineTo(10, 10);
    // context.lineTo(5, 7);
    // context.lineTo(-5, 7);
    // context.lineTo(-10, 10);
    // context.closePath();
    context.drawImage(this.img, this.radius*-1, this.radius*-1, this.radius*2, this.radius*2);

    context.stroke();
    context.restore();
  }
}
