import React, { Component } from 'react';
import Ship from './Ship';
import Asteroid from './Asteroid';
import { randomNumBetweenExcluding, randomNumBetween } from './helpers';
import { Dashboard } from './Dashboard';
import { eventPOST } from './creditSimulation';
import Modal from 'react-modal';
import { StartScreen } from './StartScreen';
import Notifications, { notify } from 'react-notify-toast';


const KEY = {
  LEFT:  37,
  DOWN: 38,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32
};

export let events = [
  {graduate_college: 'PAY_STUDENT_LOANS_30_DAYS_LATE'},
  {graduate_college: 'PAY_LOANS_ON_TIME'},
  {DUI: "NO_EFFECT"},
  {win_large_sum: "NO_EFFECT"},
  {"new_job-higher_income": "PAY_DOWN_DEBT"},
  {"new_job-lower_income": "LATE_30_DAYS"},
];

const customStyles = {
  overlay: {
  },
  content : {
    position: 'absolute',
    top: '45%',
    left: '50%',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    overflow: 'initial',
    height: '775px',
    width: '950px'
  }
};

export class Reacteroids extends Component {
  constructor() {
    super();
    this.state = {
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      context: null,
      keys : {
        left  : 0,
        right : 0,
        up    : 0,
        down  : 0,
        space : 0,
      },
      asteroidCount: 15,
      creditScore: 600,
      lifeScore: 0,
      topScore: localStorage['topscore'] || 850,
      inStart: true,
      modalIsOpen: true,
    }
    this.ship = [];
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];
  }

  handleResize(value, e){
    this.setState({
      screen : {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      }
    });
  }

  handleKeys(value, e){
    let keys = this.state.keys;
    if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) keys.left  = value;
    if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) keys.right = value;
    if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) keys.up    = value;
    if(e.keyCode === KEY.SPACE) keys.space = value;
    this.setState({
      keys : keys
    });
  }

  componentDidMount() {
    window.addEventListener('keyup',   this.handleKeys.bind(this, false));
    window.addEventListener('keydown', this.handleKeys.bind(this, true));
    window.addEventListener('resize',  this.handleResize.bind(this, false));

    const context = this.refs.canvas.getContext('2d');
    this.setState({ context: context });
    this.startGame();
    requestAnimationFrame(() => {this.update()});
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleKeys);
    window.removeEventListener('resize', this.handleKeys);
    window.removeEventListener('resize', this.handleResize);
  }

  update() {
    const context = this.state.context;
    const keys = this.state.keys;
    const ship = this.ship[0];

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    // Motion trail
    context.fillStyle = '#FBD802';
    context.globalAlpha = 1;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    // Next set of asteroids
    if(!this.asteroids.length){
      let count = this.state.asteroidCount + 1;
      this.setState({ asteroidCount: count });
      this.generateAsteroids(count);
    }

    // Check for collisions
    this.checkCollisionsWith(this.bullets, this.asteroids);
    this.checkCollisionsWith(this.ship, this.asteroids);

    // Remove or render
    this.updateObjects(this.particles, 'particles')
    this.updateObjects(this.asteroids, 'asteroids')
    this.updateObjects(this.bullets, 'bullets')
    this.updateObjects(this.ship, 'ship')

    context.restore();

    // Next frame
    requestAnimationFrame(() => {this.update()});
  }

  addScore(points){
    if(this.state.inGame){
      this.setState({
        //creditScore: this.state.creditScore + points,
        lifeScore: this.state.lifeScore + points,
      });
    }
  }

  startGame(){
    this.setState({
      inStart: true,
      inGame: true,
      creditScore: 600,
      lifeScore: 0,
    });

    var that = this;
    // Make ship
    let ship = new Ship({
      position: {
        x: this.state.screen.width/2,
        y: this.state.screen.height/2
      },
      create: this.createObject.bind(this),
      onDie: this.gameOver.bind(this),
      getSpeedMultiplier: function() {
        return (that.state.lifeScore/600) * 5;
      }
    });

    this.createObject(ship, 'ship');
    // Make asteroids
    this.asteroids = [];
    this.generateAsteroids(this.state.asteroidCount)
    this.generateZombie();
    this.generateBankrupt();
  }

  gameOver(){
    this.setState({
      inGame: false,
    });

    let ship = this.ship[0];
    // Replace top score
    if(this.state.creditScore > this.state.topScore){
      this.setState({
        topScore: this.state.creditScore,
      });
      localStorage['topscore'] = this.state.creditScore;
    }
  }

  generateAsteroids(howMany){
    let asteroids = [];
    let ship = this.ship[0];
    let that = this; //binds this for use in triggerCallback function
    for (let i = 0; i < howMany; i++) {
      let asteroid = new Asteroid({
        size: 40,
        position: {
          x: randomNumBetweenExcluding(0, this.state.screen.width, ship.position.x-60, ship.position.x+60),
          y: randomNumBetweenExcluding(0, this.state.screen.height, ship.position.y-60, ship.position.y+60)
        },
        event: this.randomEvent(),
        create: this.createObject.bind(this),
        addScore: this.addScore.bind(this),

        triggerCallback: function(event) {
          var update = eventPOST(that.state.creditScore, event);
          that.setState({creditScore: update.score});

          //MUHAHAHA...in the case of a DUI, lower their life score
          if (event == events[2]) {
            that.setState({lifeScore: that.state.lifeScore - 65});
          }
          //TODO use update.description_text in our popup
          //add more events to replace the removed one
          that.generateAsteroids(Math.floor(randomNumBetween(0,3)));

          console.log('UPDATE: ', update);
          var message = update.description_text[0];
          console.log(message);
          notify.show(message, 1000);


        }
      });

      this.createObject(asteroid, 'asteroids');
    }
  }

  generateZombie(){
    let asteroids = [];
    let ship = this.ship[0];
    let that = this; //binds this for use in triggerCallback function
    let asteroid = new Asteroid({
      size: 40,
      position: {
        x: randomNumBetweenExcluding(0, this.state.screen.width, ship.position.x-60, ship.position.x+60),
        y: randomNumBetweenExcluding(0, this.state.screen.height, ship.position.y-60, ship.position.y+60)
      },
      event: {zombie_apocalypse: "CREDIT_IS_IRRELEVANT"},
      create: this.createObject.bind(this),
      addScore: this.addScore.bind(this),
      triggerCallback: function(event) {
        var update = eventPOST(that.state.creditScore, event);
        that.setState({creditScore: update.score});

        that.setState({lifeScore: that.state.lifeScore + 100});
        //TODO use update.description_text in our popup
        //as a plus you made it through the zombie apocalypse!
        that.gameOver();
      }
    });
    this.createObject(asteroid, 'asteroids');
  }

  generateZombie(){
    let asteroids = [];
    let ship = this.ship[0];
    let that = this; //binds this for use in triggerCallback function
    let asteroid = new Asteroid({
      size: 40,
      position: {
        x: randomNumBetweenExcluding(0, this.state.screen.width, ship.position.x-60, ship.position.x+60),
        y: randomNumBetweenExcluding(0, this.state.screen.height, ship.position.y-60, ship.position.y+60)
      },
      event: {zombie_apocalypse: "CREDIT_IS_IRRELEVANT"},
      create: this.createObject.bind(this),
      addScore: this.addScore.bind(this),
      triggerCallback: function(event) {
        var update = eventPOST(that.state.creditScore, event);
        that.setState({creditScore: update.score});

        that.setState({lifeScore: that.state.lifeScore + 100});
        //TODO use update.description_text in our popup
        //as a plus you made it through the zombie apocalypse!
        that.gameOver();
      }
    });
    this.createObject(asteroid, 'asteroids');
  }

  generateBankrupt(){
    let asteroids = [];
    let ship = this.ship[0];
    let that = this; //binds this for use in triggerCallback function
    let asteroid = new Asteroid({
      size: 40,
      position: {
        x: randomNumBetweenExcluding(0, this.state.screen.width, ship.position.x-60, ship.position.x+60),
        y: randomNumBetweenExcluding(0, this.state.screen.height, ship.position.y-60, ship.position.y+60)
      },
      event: {bankruptcy: "BANKRUPT"},
      create: this.createObject.bind(this),
      addScore: this.addScore.bind(this),
      triggerCallback: function(event) {
        var update = eventPOST(that.state.creditScore, event);
        that.setState({creditScore: update.score});

        that.setState({lifeScore: that.state.lifeScore + 50});
        //TODO use update.description_text in our popup
        //as a plus you made it through the zombie apocalypse!
      }
    });
    this.createObject(asteroid, 'asteroids');
  }

  randomEvent() {
    return events[Math.floor(randomNumBetween(0,
      events.length - 1))];
  }

  createObject(item, group){
    if (item instanceof Ship) {
      if(this[group].length>0) {
        return;
      }
    }
    this[group].push(item);
  }

  updateObjects(items, group){
    let index = 0;
    for (let item of items) {
      if (item.delete) {
        this[group].splice(index, 1);
      }else{
        items[index].render(this.state);
      }
      index++;
    }
  }

  checkCollisionsWith(items1, items2) {
    var a = items1.length - 1;
    var b;
    for(a; a > -1; --a){
      b = items2.length - 1;
      for(b; b > -1; --b){
        var item1 = items1[a];
        var item2 = items2[b];
        if(this.checkCollision(item1, item2)){
          //item1.destroy();
          this.addScore(5);
          item2.destroy();
        }
      }
    }
  }

  checkCollision(obj1, obj2){
    var vx = obj1.position.x - obj2.position.x;
    var vy = obj1.position.y - obj2.position.y;
    var length = Math.sqrt(vx * vx + vy * vy);
    if(length < (obj1.radius + obj2.radius) * .9){
      return true;
    }
    return false;
  }

  closeModal() {
    console.log('THIS: ', this);
    this.setState({modalIsOpen: false});
  }

  render() {
    let startgame;
    let endgame;
    let message;

    if (this.state.creditScore <= 0) {
      message = 'Credit Score Reached 0';
    } else if (this.state.creditScore >= this.state.topScore){
      message = 'Top score with ' + this.state.creditScore + ' points. Woo!';
    } else {
      message = this.state.creditScore + ' Points though :)'
    }

    if(!this.state.inGame){
      endgame = (
        <div className="endgame">

          <p>GAME OVER</p>
          <p>{message}</p>
          <button
            onClick={ this.startGame.bind(this) }>
            Click Here To Try Again
          </button>
        </div>
      )
    }

    if(this.state.inStart){
      startgame = (
        <StartScreen/>
      )
    }

    return (
      <div>
        { endgame }

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles} >

          <div className='start-container'>
            <img src='/static/credit_chase_logo.png' className='credit-chase'/>
            <br/>
            <p>USE THE ARROW KEYS TO MOVE YOUR PLAYER AROUND THE SCREEN.</p>
            <p>COLLECT AS MANY POSITIVE LIFE EVENTS AS YOU CAN TO INCREASE</p>
            <p>YOUR LIFE SCORE AND LEARN ABOUT GOOD CREDIT. </p>
            <br/>
            <button onClick={this.closeModal.bind(this)}>START THE GAME</button>
          </div>

        </Modal>

        <canvas ref="canvas"
          width={this.state.screen.width * this.state.screen.ratio}
          height={this.state.screen.height * this.state.screen.ratio}
        />

        <div className='notifications'>
          <Notifications />
        </div>

        <Dashboard
          creditScore={this.state.creditScore}
          lifeScore={this.state.lifeScore}
        />
      </div>
    )
  }
};