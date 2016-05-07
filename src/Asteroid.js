import Particle from './Particle';
import { asteroidVertices, randomNumBetween } from './helpers';
import { events } from './Reacteroids';

export default class Asteroid {
  constructor(args) {
    this.position = args.position
    this.velocity = {
      x: randomNumBetween(-1.5, 1.5),
      y: randomNumBetween(-1.5, 1.5)
    }
    this.rotation = 0;
    this.rotationSpeed = randomNumBetween(-1, 1)
    this.radius = args.size;
    this.score = (80/this.radius)*5;
    this.create = args.create;
    this.addScore = args.addScore;
    this.vertices = asteroidVertices(8, args.size)
    
    this.triggerCallback = args.triggerCallback;

    // add properties of the different life events
    this.event = events[Math.floor(randomNumBetween(0,1))];

    this.img = new Image();
    if (this.event == events[0]) {
      this.img.src = '/static/graduate_school.svg'
      this.radius *= 1.5;
    } else {
      this.img.src = '/static/life_event.svg'
    }
  }

  destroy(){
    this.delete = true;
    this.addScore(this.score);
    
    //trigger the life event
    this.triggerCallback(this.event);
    
    // Explode
    for (let i = 0; i < this.radius; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 3),
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

    // // Break into smaller asteroids
    // if(this.radius > 10){
    //   for (let i = 0; i < 2; i++) {
    //     let asteroid = new Asteroid({

    //       size: this.radius/2,
    //       position: {
    //         x: randomNumBetween(-10, 20)+this.position.x,
    //         y: randomNumBetween(-10, 20)+this.position.y
    //       },
    //       create: this.create.bind(this),
    //       addScore: this.addScore.bind(this)
    //     });
    //     this.create(asteroid, 'asteroids');
    //   }
    // }
  }

  render(state){
    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Rotation
    this.rotation += this.rotationSpeed;
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    // Screen edges
    if(this.position.x > state.screen.width + this.radius) this.position.x = -this.radius;
    else if(this.position.x < -this.radius) this.position.x = state.screen.width + this.radius;
    if(this.position.y > state.screen.height + this.radius) this.position.y = -this.radius;
    else if(this.position.y < -this.radius) this.position.y = state.screen.height + this.radius;

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.fillStyle = '#FFF';
    //context.fillRect(0, 0, this.radius, this.radius);
    //context.stroke();
    context.drawImage(this.img, this.radius/2*-1, this.radius/2*-1, this.radius, this.radius);
    context.stroke();
    context.restore();
  }
}