
function Barrier(x, y){

  this.width = 100;
  this.height = 15;
  this.angle = 0;

  this.x = 0 - this.width/2; //- this.width/2;
  this.y = y/4; //+ this.height;

  this.dirX = 0;
  this.dirY = 0;

  this.speedX = 5;
  this.speedY = 5;

  this.setDirX = function(dir){
    this.dirX = dir;
  }

  this.setDirY = function(dir){
    this.dirY = dir;
  }

  this.moveX = function(x, y){
    var xLimit = parseFloat(x);
    var yLimit = parseFloat(y);

    this.x += this.speedX * this.dirX;
    this.checkBoundries(xLimit, yLimit);
  }

  this.moveY = function(x, y){
    var xLimit = parseFloat(x);
    var yLimit = parseFloat(y);

    this.y += this.speedY * this.dirY;
    this.checkBoundries(xLimit, yLimit);
  }

  this.checkBoundries = function(xLimit, yLimit){
    //left boundry
    if(this.x < (xLimit * -1)/2){
      this.x = (xLimit * -1)/2;
    }
    //right boundry
    else if((this.x + this.width) > xLimit/2){
      this.x = xLimit/2 - this.width;
    }
    //center boundry
    if(this.y < 0){
      this.y = 0;
    }
    //bottom boundry
    else if(this.y + this.height > y/2){
      this.y = y/2 - this.height;
    }
  }
}

module.exports = Barrier;
