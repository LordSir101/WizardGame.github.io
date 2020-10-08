//Player class that holds score
function Fireball(x, y){
  //postions
  this.x = x;
  this.y = y;
  this.speedY = 3.5;
  this.speedX = 0;
  this.angle = Math.PI; //angle 0 is pointed straight down
  this.deflectionAngle = 70 * Math.PI/180;
  this.offset = 10;  //used to make fireball hitbox more forgiving
  this.orientation = "UP";
  this.hasHit = false;


  //dimensions of sprite
  this.width = 40;
  this.height = 40;

  this.timeAlive = 0;
  this.timeSinceDeflection = 0;
  this.frame = 1;
  this.animationRate = 10;

  //Takes a negative or positive 1 as a direction
  this.move = function(){
    this.y -= this.speedY;
    this.x += this.speedX;
  }

  this.update = function(){
    if(this.timeAlive > this.animationRate){
      this.changeFrame(); //switches to next frame in animation
      this.timeAlive = 0;
    }
    else{
      this.timeAlive++;
    }
    if(this.timeSinceDeflection > 0){this.timeSinceDeflection--}
  }

  this.changeFrame = function(){
    if(this.frame == 1){
      this.frame = 2;
    }
    else if(this.frame == 2){
      this.frame = 1;
    }
  }

  this.checkCollision = function(barrier){
    if(this.timeSinceDeflection > 0){return};
    //coordinates of the centers of the sprites
    var fireballCx = (this.x + this.width*1.5); //actual position + rotation position + half the sprite
    var fireballCy = this.y + this.height/2;
    //When the fireball gets deflected, the canvas gets rotated so the positions of the barrier must be reflected
    //based on the orientation of the fireball. multiply by 1 going down and -1 going up
    var barrierCx = (barrier.x + barrier.width/2); //* Math.cos(this.angle + Math.PI);
    var barrierCy = (barrier.y + barrier.height/2);// * Math.cos(this.angle + Math.PI);

    //distance between center and the edges
    var fireballLengthX = this.width/2;
    var fireballLengthY = this.height/2;
    var barrierLengthX = barrier.width/2;
    var barrierLengthY = barrier.height/2;

    //distance between centers
    var distanceY = Math.abs(fireballCy - barrierCy);
    var distanceX = Math.abs(fireballCx- barrierCx);

    //if distance between fireball and barrier is less than the barrier height, deflect
    if(distanceY < barrierLengthY + fireballLengthX  && distanceX < barrierLengthX + fireballLengthX){
      this.deflect(barrier.angle);
      return true;
    }
    else{
      return false;
    }
  }

  this.checkOutOfBounds = function(w){
    var xpos = parseFloat(this.x);
    var height = parseFloat(this.height);
    //right side
    if(xpos + this.width*1.5 > w/2){
      this.deflectWall(-90 * Math.PI/180);
      return true;
    }
    //left side
    else if(xpos + this.width*1.5 < -1 * w/2){
      this.deflectWall(90 * Math.PI/180); //this angle is different because of the way the sprite is drawn
      return true;
    }
  }

  this.dealtDamage = function(y){
    var ypos = parseFloat(this.y);

    //A fireball at the top of the screen will be at the bottom of the enemy screen
    //checks if its actual position or its position as an enemy is at the bottom of the screen
    if(ypos * Math.cos(this.angle + Math.PI) > y/2 || ypos > y/2){
      return true;
    }
    else{return false;}
  }

  this.dist = function(x1, y1, x2, y2) {
    var deltaX = x2 - x1;
    var deltaY = y2 - y1;
    var dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    return dist;
  }

  this.deflect = function(angle, type){
    var barrier = type;
    //****Angular deflections****
    //***NOTE: Fireballs can only be deflected if hit from the front.
    //therefore, you can pass through a fireball from behing and then deflect it
    //fireball moving down hitting barrier moving left
    if(angle < 0 && this.speedY < 0){
      //if (this.orientation == "DOWNRIGHT"){return;} //prevents from being deflected again in the same direction
      if(this.speedX != -4)this.speedX = -4;
      if(this.speedY == 3.5)this.speedY += 1;
      this.angle = this.deflectionAngle - 20*Math.PI/180 - Math.PI/2;//-
      //this.orientation = "UPLEFT";
    }
    //fireball moving down hitting barrier moving right
    else if(angle > 0 && this.speedY < 0){
      //if (this.orientation == "DOWNLEFT"){return;}
      if(this.speedX != 4){this.speedX = 4;}
      if(this.speedY == 3.5)this.speedY += 1;
      this.angle = this.deflectionAngle; //+
      //this.orientation = "UPRIGHT";
    }
    //fireballs moving up can be hit by enemy and self barriers.
    //firball moving up hitting barrier moving left
    else if(angle < 0 && this.speedY > 0){
      //if (this.orientation == "UPLEFT"){return;}
      if(barrier = "self")this.speedX = 4;
      else if(barrier = "enemy")this.speedX = -4;
      if(this.speedY == 3.5)this.speedY -= 1;
      this.angle = this.deflectionAngle - 20*Math.PI/180 + Math.PI/2; //-
      //this.orientation = "DOWNRIGHT";
    }
    //fireball moving up hitting barrier moving right
    else if(angle > 0 && this.speedY > 0){
      //if (this.orientation == "UPRIGHT"){return;}//prevents deflection if barrier hits fireball from bottom
      if(barrier = "self")this.speedX = -4;
      else if(barrier = "enemy")this.speedX = 4;
      if(this.speedY == 3.5)this.speedY -= 1;
      this.angle = this.deflectionAngle + Math.PI; //+
      //this.orientation = "DOWNLEFT";
    }
    else if(angle == 0 && this.speedY > 0){
      //if(this.orientation == "DOWN"){return;}
      this.speedX = 0;
      if(Math.abs(this.speedY) < 3.5){this.speedY += 1};
      this.angle = Math.PI;
      //this.orientation = "DOWN";
    }
    else if(angle == 0 && this.speedY < 0){
      //if(this.orientation == "UP"){return;}
      this.speedX = 0;
      if(Math.abs(this.speedY) < 3.5){this.speedY -= 1};
      this.angle = 0;
      //this.orientation = "UP";
    }
    this.speedY *= -1;
    this.angle += Math.PI; //change rotation
    this.timeSinceDeflection = 32;
  }

  this.deflectWall = function(angle){
    if(this.speedY < 0){
      this.angle -= angle;
    }
    else{
      this.angle += angle;
    }

    //correct orientation
    /*
    if(this.orientation == "UPRIGHT"){this.orientation = "UPLEFT"}
    else if(this.oreientation == "UPLEFT"){this.oreientation = "UPRIGHT"}
    else if(this.oreientation == "DONWLEFT"){this.oreientation = "DOWNRIGHT"}
    else if(this.oreientation == "DOWNRIGHT"){this.oreientation = "DOWNLEFT"}*/
    this.speedX *= -1;
  }

}

module.exports = Fireball;
