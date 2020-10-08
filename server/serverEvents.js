const Wizard = require('./wizard.js');
const Fireball = require('./Fireball.js');
const Barrier = require('./barrier.js');

class Events{
  constructor(p1, p2){
    this.players = [p1, p2];
    this.wizards = [];
    this.w;
    this.h;
    this.spriteW = 100;
    this.spriteH = 100;
    this.startTime = new Date();
    this.RATE_OF_FIRE = 500;
    this.enemyBarrier = new Barrier(0, 0); //a barrier that represents the enemy relative to the player
    this.enemyFireball = new Fireball(0, 0);//a fireball that represents the enemy relative to the player
    this.loop;
    this.hitDelay = 50;
    //this.shootSound = new Audio("audio/fireball shot.mp3");

    //start listener for each player
    this.players.forEach((player, idx) =>{
      player.start = false;
      player.on('start', (w, h, color) =>{
        player.start = true;
        player.color = color;
        player.colorSent = false;

        if(this.players[0].start && this.players[1].start){
          this.__start(w, h, player);
        }
      });
    });

    //add event listner for each player
    this.players.forEach((player, idx) => {
      player.on('keydown', (e) => {
        this.__keyPressed(idx, e, this.wizards);
      });
    });

    this.players.forEach((player, idx) => {
      player.on('keyup', (e) => {
        this.__keyUp(idx, e);
      });
    });

    this.players.forEach((player, idx) => {
      player.on('gameOver', (e) => {
        this.players.forEach((player, idx) => {
          player.start = false;
          clearTimeout(this.loop);
          player.emit("endGame");
        });
      });
    });


  }//end Events

  //Call setup for each player on start-----------------------------------------------------------------
  __start(w, h, player){

    this.players.forEach((player, idx) => {
      this.__setup(w, h, idx, player)
    });

    this.__updateVariables();

    this.players.forEach((player, idx) => {
      player.emit("startAnimation");
      //player.emit("drawBorders");
    });
  }

  //main game loop---------------------------------------------------------------------------------------------
  __updateVariables(){
      this.__move();
      this.__update();

      this.loop = setTimeout(this.__updateVariables.bind(this), 16.6);
  }


  //Inital setup---------------------------------------------------------------------------------------------------
  __setup(w, h, idx, player){

    this.players[idx].emit('drawBackground');
    this.w = w;
    this.h = h;
    //give each player a wizard
    this.wizards[idx] = new Wizard(0-(this.spriteW/2), this.h/2-this.spriteH * 1.8, this.spriteW, this.spriteH, player.color, this.w, this.h);

  }

  //Key Press Handlers------------------------------------------------------------------------------------------------
  __keyPressed(idx, e, wizards){
    //check if player can shoot again
    var currentTime = new Date();
    var timeElapsed = currentTime - this.startTime;

    //UP (shoot)
    if(e == 38 && timeElapsed > this.RATE_OF_FIRE){
      this.wizards[idx].action = "SHOOTING";
      this.wizards[idx].fireballs.push(new Fireball(this.wizards[idx].x, this.wizards[idx].y - 30));
      this.startTime = new Date(); //reset timer

      //tell each player to play a sound
      this.players.forEach((player)=>{
        player.emit("playSound", "shooting");
      });

      //animation runs for as long as RATE_OF_FIRE
      setTimeout(function(){
        wizards[idx].action = "STANDING";
      }, this.RATE_OF_FIRE); //This number sets how long the shoot animation lasts for
    }
    //LEFT
    else if(e == 37){this.wizards[idx].setDir(-1);}
    //RIGHT
    else if(e == 39){this.wizards[idx].setDir(1);}

    //Barrier movement
    //A
    else if(e == 65){
      this.wizards[idx].barrier.setDirX(-1);
      this.wizards[idx].barrier.angle = -20 * Math.PI/180;
    }
    //D
    else if(e == 68){
      this.wizards[idx].barrier.setDirX(1);
      this.wizards[idx].barrier.angle = 20 * Math.PI/180;
    }
    //W
    else if(e == 87){
      this.wizards[idx].barrier.setDirY(-1);
       //so moving up and down dont override the tilt
      //this.wizards[idx].barrier.angle = this.wizards[idx].barrier.angle;
    }
    //S
    else if(e == 83){
      this.wizards[idx].barrier.setDirY(1);
      //this.wizards[idx].barrier.angle = this.wizards[idx].barrier.angle;
      //this.wizards[idx].barrier.angle = 20 * Math.PI/180;
    }
  }

  __keyUp(idx, e){
    //LEFT and RIGHT
    if(e == 37 || e == 39){this.wizards[idx].setDir(0);}
    //RIGHT
    //else if(e == 39){this.wizards[idx].setDir(0);}
    //A and D
    else if(e == 65 || e == 68){
      this.wizards[idx].barrier.setDirX(0);
      this.wizards[idx].barrier.angle = 0;
    }
    //D
    //else if(e == 68){this.wizards[idx].barrier.setDirX(0)}
    //W and S
    else if(e == 87 || e == 83){
      this.wizards[idx].barrier.setDirY(0);
      //this.wizards[idx].barrier.angle = 0;
    }
  }

  //Send Variables to client------------------------------------------------------------------------------------
  __update(){

    this.players.forEach((player, idx) => {
      //update the color of the wizards once
      if(!player.colorSent){
        if(idx == 0){
          this.players[1].emit("enemyColor", this.wizards[0].color);
          this.players[0].colorSent = true;
        }
        else if(idx == 1){
          this.players[0].emit("enemyColor", this.wizards[1].color);
          this.players[1].colorSent = true;
        }
      }

      });

      //update the frame of each fireball and check if it is out of bounds
      this.wizards.forEach((wizard) =>{
          this.__checkDamageDealt(wizard);


          for(var i = wizard.fireballs.length -1; i >= 0; i--){
            //Check for collisions
            if(this.__checkCollisions(wizard, i)||
              wizard.fireballs[i].checkOutOfBounds(this.w)){

              this.players.forEach((player)=>{
                player.emit("playRebound");
              });
            }
            wizard.fireballs[i].update();
          }
        });

      //for each player update sends the wizard object
      //for each player updateEnemy sends the enemy wizard object
      this.players.forEach((player, idx) => {

        this.__checkIfHit(this.wizards[idx]);
        if(this.wizards[idx].isHit){
          this.players[idx].emit("freeze");
          this.wizards[idx].barrier.setDirX(0);
          this.wizards[idx].barrier.angle = 0;
          this.wizards[idx].setDir(0);
          this.wizards[idx].isHit = false;
        }
        if(idx == 0){
            player.emit('update', this.wizards[0]);
            player.emit('updateEnemy', this.wizards[1]);
            player.emit('drawborders');
        }
        else if(idx == 1){
          player.emit('update', this.wizards[1]);
          player.emit('updateEnemy', this.wizards[0]);

        }

    }); //end for loop
  }

  //Move every sprite on screen----------------------------------------------------------------------------------
  __move(){
    this.players.forEach((player, idx) => {
        this.wizards[idx].move(this.w);
        this.wizards[idx].barrier.moveX(this.w, this.h);
        this.wizards[idx].barrier.moveY(this.w, this.h);
        this.wizards[idx].fireballs.forEach((fireball)=>{
          fireball.move();
        });
    });
  }

//check if a player has been hit
  __checkIfHit(wizard){
    if(wizard == this.wizards[0]){
      for(var i = this.wizards[0].fireballs.length -1; i >=0; i--){
        if(this.wizards[0].fireballs[i].hasHit){continue};
        if(wizard.checkIfHit(this.wizards[0].fireballs[i])){

            this.wizards[0].fireballs[i].hasHit = true;
            this.__getRidOfFireball(0, 0, i);

        }
      }

      for(var i = this.wizards[1].fireballs.length -1; i >=0; i--){
        this.enemyFireball.x = this.wizards[1].fireballs[i].x; //+ this.wizards[1].fireballs[i].width * 1.5)* -1;
        this.enemyFireball.y = (this.wizards[1].fireballs[i].y * -1); //+ this.wizards[1].fireballs[i].height/2) * -1;
        if(this.wizards[1].fireballs[i].hasHit){continue};
        if(wizard.checkIfHit(this.enemyFireball)){//collisions with enemy barrier

            this.wizards[1].fireballs[i].hasHit = true;
            this.__getRidOfFireball(0, 1, i);

        }
      }
    }

  else if(wizard == this.wizards[1]){
    for(var i = this.wizards[1].fireballs.length -1; i >=0; i--){
        if(this.wizards[1].fireballs[i].hasHit){continue};
        if(wizard.checkIfHit(this.wizards[1].fireballs[i])){//collisions with enemy barrier
          this.wizards[1].fireballs[i].hasHit = true;
          this.__getRidOfFireball(1, 1, i);
      }
    }

    for(var i = this.wizards[0].fireballs.length -1; i >=0; i--){
      this.enemyFireball.x = this.wizards[0].fireballs[i].x; //+ this.wizards[0].fireballs[i].width * 1.5)* -1;
      this.enemyFireball.y = (this.wizards[0].fireballs[i].y * -1); //+ this.wizards[0].fireballs[i].height/2) * -1;
      if(this.wizards[0].fireballs[i].hasHit){continue};
        if(wizard.checkIfHit(this.enemyFireball)){//collisions with enemy barrier

          this.wizards[0].fireballs[i].hasHit = true;
          this.__getRidOfFireball(1, 0, i);
        }
      }
    }
  }

//Check fireball collisions with barriers
  __checkCollisions(wizard, i){
    if(wizard == this.wizards[0]){
      //From player perspective, when the fireball is going up, the position of the enemy barrier is
      //reflected over the y axis.  Therefore we need to multiply the actual barrier position by
      //-1.  When going down, we don't want to reflect it because the canvas (and therfore the barrier)
      //has been rotated from the fireballs perspective.
      var angle = this.wizards[1].barrier.angle;
      //positions of the enemy barrier relative to the wizard
      this.enemyBarrier.x = (this.wizards[1].barrier.x *-1/** Math.cos(angle)*/) - this.wizards[1].barrier.width;
      this.enemyBarrier.y = (this.wizards[1].barrier.y *-1/* * Math.cos(angle)*/) - this.wizards[1].barrier.height;
      this.enemyBarrier.angle = angle;

      if(wizard.fireballs[i].checkCollision(this.wizards[0].barrier, "self")|| //collisions with player barrier
        wizard.fireballs[i].checkCollision(this.enemyBarrier, "enemy")){//collisions with enemy barrier

        return true;
      }
      else{
        return false;
      }
    }

    else if(wizard == this.wizards[1]){
      var angle = this.wizards[0].barrier.angle;
      //positions of the enemy barrier relative to the wizard
      this.enemyBarrier.x = (this.wizards[0].barrier.x *-1 /** Math.cos(angle)*/) - this.wizards[0].barrier.width;
      this.enemyBarrier.y = (this.wizards[0].barrier.y * -1/** Math.cos(angle)*/) - this.wizards[0].barrier.height;
      this.enemyBarrier.angle = angle;

      if(wizard.fireballs[i].checkCollision(this.wizards[1].barrier, "self") || //collisions with player barrier
        wizard.fireballs[i].checkCollision(this.enemyBarrier, "enemy")){//collisions with enemy barrier
            return true;
        }
      else{
        return false;
      }
    }
  }

//Check if a fireball has passed a player
  __checkDamageDealt(wizard){

    //each wizard checks if its own fireballs are at the bottom.
    //each wizard has to check if the enemy fireballs are at the bottom relative to them
    //this means that to check for enemy damage, the positions have to be refelected
    if(wizard == this.wizards[0]){
      for(var i = this.wizards[0].fireballs.length -1; i >= 0; i--){
        if(this.wizards[0].fireballs[i].dealtDamage(this.h)){
          wizard.health -= 1;
          wizard.fireballs.splice(i, 1);
        }
      }

      for(var i = this.wizards[1].fireballs.length -1; i >= 0; i--){
        var fireball = this.wizards[1].fireballs[i];
        //positions of the enemy fireball relative to the player
        this.enemyFireball.x = (fireball.x + fireball.width * 2) * -1;
        this.enemyFireball.y = (fireball.y + fireball.height/2) * -1;

        if(this.enemyFireball.dealtDamage(this.h)){
          wizard.health -= 1;
          this.wizards[1].fireballs.splice(i, 1);
        }
      }
    }//end wizard 0

    if(wizard == this.wizards[1]){
      for(var i = this.wizards[1].fireballs.length -1; i >= 0; i--){
        if(this.wizards[1].fireballs[i].dealtDamage(this.h)){
          wizard.health -= 1;
          wizard.fireballs.splice(i, 1);
        }
      }

      for(var i = this.wizards[0].fireballs.length -1; i >= 0; i--){
        var fireball = this.wizards[0].fireballs[i];

        //positions of the enemy fireball relative to the player
        this.enemyFireball.x = (fireball.x + fireball.width * 2) * -1;
        this.enemyFireball.y = (fireball.y + fireball.height/2) * -1;

        if(this.enemyFireball.dealtDamage(this.h)){
          wizard.health -= 1;
          this.wizards[0].fireballs.splice(i, 1);
        }
      }
    }//end wizard 1

  }

  __getRidOfFireball(idx1, idx2, i){
    this.wizards[idx1].isHit = true;

    //this gies time for the fireball to travel into the enemy sprite
    setTimeout((i)=>{
      this.wizards[idx2].fireballs.splice(i, 1);
    }, this.hitDelay);

  }

}//end events

module.exports = Events;
