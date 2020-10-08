const Barrier = require('./barrier.js');

function Wizard(x, y, width, height, color, w, h){
  this.action = "STANDING";
  this.readyToShoot = "ready";
  this.color = color;
  this.health = 10;
  this.isHit = false;
  //postions
  this.x = x;
  this.y = y;

  this.dir = 0;

  //dimensions of sprite
  this.width = width;
  this.height = height;

  this.fireballs = [];

  this.barrier = new Barrier(w, h);

  this.setDir = function(dir){
    this.dir = dir;
  }

  //Takes a negative or positive 1 as a direction
  this.move = function(x){
    var xpos = parseFloat(x);
    this.x += 3 * this.dir;

    //left boundry
    if(this.x < (xpos * -1)/2){
      this.x = (xpos * -1)/2;
    }
    //right boundry
    else if((this.x + this.width) > xpos/2){
      this.x = xpos/2 - this.width;
    }

  }

  this.checkIfHit = function(fireball){
    var fireballCx = (fireball.x + fireball.width*1.5); //actual position + rotation position + half the sprite
    var fireballCy = fireball.y + fireball.height/2;

    //center of the wizard hitbox
    var wizardCx = (this.x + this.width/2.2); //* Math.cos(this.angle + Math.PI);
    var wizardCy = (this.y + this.height/1.5);// * Math.cos(this.angle + Math.PI);

    //distance between center and the edges of the hitbox
    var fireballLengthX = fireball.width/4;
    var fireballLengthY = fireball.height/3;
    var wizardLengthX = this.width/4.5;
    var wizardLengthY = this.height/3;

    //distance between centers

    var distanceY = Math.abs(fireballCy - wizardCy);
    var distanceX = Math.abs(fireballCx- wizardCx);
    //var distanceY = Math.abs(fireballCy - wizardCy);

    //if distance between fireball and barrier is less than the barrier height, deflect
    if(distanceY < (wizardLengthY + fireballLengthY) && distanceX < (wizardLengthX + fireballLengthX)){
      //console.log("collided");
      return true;
    }
    //if(fireballCx > this.x + this.width/4 && fireballCx < this.x + this.width*3/4 && fireballCy > this.y + this.height/4){


  //  }
    return false;
  }

}

module.exports = Wizard;
