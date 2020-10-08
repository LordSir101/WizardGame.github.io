var sock = io();

var barrierImg = document.createElement('img');
var standing = document.createElement('img');
var shooting = document.createElement('img');
var fireball1 = document.createElement('img');
var fireball2 = document.createElement('img');

var enemyBarrierImg = document.createElement('img');
var standingEnemy = document.createElement('img');
var shootingEnemy = document.createElement('img');
var enemyFireball1 = document.createElement('img');
var enemyFireball2 = document.createElement('img');

var heart = document.createElement('img');
heart.src = "images/heart.png";

var background = document.createElement('img');
background.src = "images/background castle.png";
var enemyBackground = document.createElement('img');
enemyBackground.src = "images/background enemy 8.png";



var canvas = document.getElementById('canvas1');
var ctx = canvas.getContext('2d');
var canvas2 = document.getElementById('canvas2');
var ctx2 = canvas2.getContext('2d');

var w = canvas.width;
var h = canvas.height;
var w2 = canvas2.width;
var h2 = canvas2.height;
ctx.translate(w/2, h/2);
ctx2.translate(w2/2, h2/2);

var animation;
var gameLost = false;
var colorChosen;
var color;
var enemyColor;
var score = 0;
var enemyScore = 0;

//sounds that can be played when a player shoots
var sounds = {
 shooting: [new Sound("audio/fireball shot.mp3"),
            new Sound("audio/fireball shoot 2.mp3")
          ],
 endGame:[new Sound("audio/Victory.mp3"),
          new Sound("audio/defeat.mp3")
          ]

}
var reboundSound = new Sound("audio/Magical Rebound.mp3");


var backMusic;

var xPos;
var yPos;
var spriteWidth = 100;
var spriteHeight = 100;
var enemyX;
var enemyY;
var barrier;
var enemyBarrier;
var action = "STANDING";
var enemyAction = "STANDING";
var fireballs = [];
var enemyFireballs = [];
var health;
var enemyHealth;
var bordersDrawn = false;


//start game-------------------------------------------------------------------------------------------------------------
document.addEventListener('keydown', userPressedKey);
document.addEventListener('keyup', userReleasedKey);
document.querySelector('#startbutton').addEventListener('clicked', start);

function start(){

  setup();
  //we have to send 'start' to server first so that we can send a setup emmission to both clients from the server
  //otherwise, if this was the second game, the player that did not press the start button would not go through setup
  sock.emit('start', w2, h2, color);
}

//sock.on("startAnimation", animationLoop); //start drawing
sock.on("startAnimation", ()=>{
  //drawBackground();
  animationLoop();
  //backMusic.currentTime = 0;
  backMusic.play();
});

//Event handlers----------------------------------------------------------------------------------------------
function userPressedKey(e){
  e.preventDefault();
  sock.emit('keydown', e.keyCode);
}

function userReleasedKey(e){
  e.preventDefault();
  sock.emit('keyup', e.keyCode);
}

//Draw background-----------------------------------------------------------------------------------------------------------
sock.on('drawBackground', drawBackground);
function drawBackground(){

  ctx.drawImage(background, -w/2,  0, w, h/2);
  ctx.drawImage(enemyBackground, -w/2, -h/2, w, h/2);

  /*
  ctx.save();
  ctx.translate(0, -h/4);
  ctx.rotate(Math.PI);
  //ctx.drawImage(barrierImg, barrier.width/2 * -1, barrier.height/2*-1, barrier.width, barrier.height);
  ctx.drawImage(background, w/2 * -1, h/4*-1, w, h/2);
  ctx.restore();
*/
}


//Update Variables-----------------------------------------------------------------------------------------------------------
sock.on('update', (wizard)=>{
  xPos = parseFloat(wizard.x);
  yPos = parseFloat(wizard.y);
  action = wizard.action;
  fireballs = wizard.fireballs;
  barrier = wizard.barrier;
  health = wizard.health;

});
sock.on('updateEnemy', (wizard)=>{
  enemyX = parseFloat(wizard.x);
  enemyY = parseFloat(wizard.y);
  enemyAction = wizard.action;
  enemyFireballs = wizard.fireballs;
  enemyBarrier = wizard.barrier;
  enemyHealth = wizard.health;

});

sock.on("enemyColor", (color)=>{
  standingEnemy.src = "images/Enemy " + color + " Wizard Standing 2.png"
  shootingEnemy.src = "images/Enemy " + color + " Wizard Shooting 2.png"
  enemyFireball1.src = "images/Fireball " + color + " 1.png";
  enemyFireball2.src = "images/Fireball " + color + " 2.png";
  enemyBarrierImg.src = "images/" + color + " barrier.png"
  enemyColor = color;
  drawScore();

});

sock.on("endGame", ()=>{
  cancelAnimationFrame(animation);
  animation = null;
  backMusic.stop();
  clear();
  displayEndScreen();
})

sock.on("playSound", (sound)=>{
  playSound(sound);
});
sock.on("playRebound", playReboundSound);
sock.on("freeze", freeze);

function setEnemyColor(color){

}
//Main loop------------------------------------------------------------------------------------------------------
function animationLoop(){
  clear();
  setFireballsOreientation();
  drawSprite(standing, xPos, yPos, spriteWidth, spriteHeight);
  drawEnemy(standingEnemy, enemyX, enemyY, spriteWidth, spriteHeight);
  drawBarriers();
  displayHealth();

  if(health == 0){
    gameLost = true;
    sock.emit("gameOver");
  }

  animation = requestAnimationFrame(animationLoop);
}

//Draw Sprites-------------------------------------------------------------------------------------------

function drawSprite(standing, xPos, yPos, spriteWidth, spriteHeight){

  //standing player sprite at bottom of screen
  if(action == "STANDING"){
    ctx2.drawImage(standing, xPos, yPos, spriteWidth, spriteHeight);
  }
  //play the shooting animation if current action is shooting
  else{
    ctx2.drawImage(shooting, xPos, yPos, spriteWidth, spriteHeight);
  }
/*
  ctx2.fillStyle = "red";
  ctx2.fillRect(xPos + spriteWidth/2.2, yPos + spriteHeight/1.5, 5 , 5);
  ctx2.fillRect(xPos + spriteWidth/2.2 + spriteWidth/4.5, yPos + spriteHeight/1.5 - spriteHeight/3, 5 , 5);
  ctx2.fillRect(xPos + spriteWidth/2.2 - spriteWidth/4.5, yPos + spriteHeight/1.5 - spriteHeight/3, 5 , 5);*/
}

function drawEnemy(standingEnemy, enemyX, enemyY, spriteWidth, spriteHeight){
  //Reverse the coordinates of the enemy wizard to draw the enemy at the top of the screen

  //***Reference is from top left corner***
  enemyX = (enemyX * -1) - spriteWidth;
  enemyY = (enemyY * -1) - spriteHeight;

  if(enemyAction == "STANDING"){
    ctx2.drawImage(standingEnemy, enemyX, enemyY, spriteWidth, spriteHeight);
  }
  //play shooting animation when enemy shoots but don't disable any inputs
  else{
    ctx2.drawImage(shootingEnemy, enemyX, enemyY, spriteWidth, spriteHeight);
  }

}

function setFireballsOreientation(){
  //***Reference is from top left corner***
  fireballs.forEach((fireball)=>{
    drawFireballs(fireball, fireball.angle, "player");
  });

  enemyFireballs.forEach((fireball)=>{
    drawEnemyFireballs(fireball, fireball.angle + Math.PI); //enemy fireballs need to be rotated
    });
}

function drawFireballs(fireball, angle, type){
/*
  var x = (fireball.x + fireball.width * 2) * -1;
  var y = (fireball.y + fireball.height/2) * -1;

  ctx2.save();
  ctx2.rotate(angle);
  if(fireball.frame == 1){
    if(type == "player"){ctx2.drawImage(fireball1, x, y, fireball.width, fireball.height);}
    else if(type == "opponent"){ctx2.drawImage(enemyFireball1, x, y, fireball.width, fireball.height);}
  }
  else if(fireball.frame == 2){
    if(type == "player"){ctx2.drawImage(fireball2, x, y, fireball.width, fireball.height);}
    else if(type == "opponent"){ctx2.drawImage(enemyFireball2, x, y, fireball.width, fireball.height);}
  }
  ctx2.restore();*/


  ctx2.save();
  ctx2.translate(fireball.x + fireball.width + fireball.width/2, fireball.y + fireball.height/2);
  ctx2.rotate(angle);
  if(fireball.frame == 1){
      ctx2.drawImage(fireball1, fireball.width/2 * -1, fireball.height/2 * -1, fireball.width, fireball.height);
  }
  else if(fireball.frame == 2){
    ctx2.drawImage(fireball2, fireball.width/2 * -1, fireball.height/2 * -1, fireball.width, fireball.height);
  }
  ctx2.restore();
  ctx2.fillStyle = "red";
  var y;
  if(fireball.speedY > 0){
    y = fireball.y + fireball.height/2
  }
  else if(fireball.speedY < 0){
    y = fireball.y + fireball.height/2;
  }

/*
  var y = fireball.y + fireball.height/2;
  ctx2.fillRect(fireball.x + fireball.width*1.5, y, 5 , 5); //fireball.y + fireball.height /2
  ctx2.fillRect(fireball.x + fireball.width*1.5 + fireball.width/4, y + fireball.height/3, 5 , 5);
  ctx2.fillRect(fireball.x + fireball.width*1.5 - fireball.width/4, y + fireball.height/3, 5 , 5);*/

}

function drawEnemyFireballs(fireball, angle){
  var enemyX = (fireball.x + fireball.width + fireball.width/2) * -1;
  var enemyY = (fireball.y + fireball.height/2) * -1;
  ctx2.save();
  ctx2.translate(enemyX, enemyY);
  ctx2.rotate(angle);

  if(fireball.frame == 1){
    ctx2.drawImage(enemyFireball1, fireball.width/2 * -1, fireball.height/2 * -1, fireball.width, fireball.height);
  }
  else if(fireball.frame == 2){
    ctx2.drawImage(enemyFireball2, fireball.width/2 * -1, fireball.height/2 * -1, fireball.width, fireball.height);
  }
  ctx2.restore();
  //ctx2.fillRect((fireball.x +fireball.width * 1.5)* -1, (fireball.y + fireball.height/2) * -1, 5 , 5);
}


function drawBarriers(){
  var angle = barrier.angle;
  ctx2.save();
  ctx2.translate(barrier.x + barrier.width/2, barrier.y + barrier.height /2);
  ctx2.rotate(angle);
  ctx2.drawImage(barrierImg, barrier.width/2 * -1, barrier.height/2 * -1, barrier.width, barrier.height);
  ctx2.restore();

  //enemy barrier
  var xEnemy = (enemyBarrier.x * -1) - enemyBarrier.width;
  var yEnemy = (enemyBarrier.y * -1)- enemyBarrier.height;
  ctx2.save();
  ctx2.translate(xEnemy + enemyBarrier.width/2, yEnemy + enemyBarrier.height /2);
  ctx2.rotate(Math.PI + enemyBarrier.angle);
  ctx2.drawImage(enemyBarrierImg, enemyBarrier.width/2 * -1, enemyBarrier.height/2 * -1,  enemyBarrier.width, enemyBarrier.height);
  ctx2.restore();

}
//function drawEnemyBarrier(){}

function clear(){
  ctx2.clearRect(0 - w2/2, 0 - h2/2, w2, h2);
}

function playSound(sound){
  //number of sounds
  var soundtype = sound;
  var max = 1;
  var min = 0;
  var idx = Math.floor(Math.random() * (max - min + 1)) + min;
  sounds[soundtype][idx].sound.volume = 0.9;
  sounds[soundtype][idx].play();
}

function playReboundSound(){
  if(!reboundSound.paused){
    reboundSound.stop();
    reboundSound.sound.currentTime = 0;
    reboundSound.play();
  }
  else{
    reboundSound.play();
  }
}

function displayHealth(){
  //var healthString = health + "";
  ctx2.font = "20px Verdana"
  ctx2.textAlign = 'left'; //bases the poition of the text from the top left corner
  ctx2.textBaseline = 'top';
  ctx2.fillStyle = "white";
  ctx2.lineWidth = 3;

  ctx2.drawImage(heart, (w2/2) * -1 + 10, h2/2 - 30, 20, 20);
  ctx2.fillText(health, (w2/2) * -1 + 30, h2/2 - 30);
  ctx2.drawImage(heart, (w2/2) * -1 + 10, -h2/2 + 20, 20, 20);
  ctx2.fillText(enemyHealth, (w2/2) * -1 + 30, -h2/2 + 20)
}

function displayEndScreen(){
  var text;
  var textLength;
  ctx2.font = "50px Verdana"
  ctx2.textAlign = 'left'; //bases the poition of the text from the top left corner
  ctx2.textBaseline = 'top';
  ctx2.fillStyle = "white";
  ctx2.lineWidth = 3;

  if(gameLost){
    text = "You Lose";
    textLength = ctx2.measureText(text).width
    ctx2.fillText(text, w2/2 - textLength * 2, 0);
    sounds["endGame"][1].sound.volume = 1;
    sounds["endGame"][1].play();
    enemyScore++;
  }
  else if(!gameLost){
    text = "You Win";
    textLength = ctx2.measureText(text).width
    ctx2.fillText(text, w2/2 - textLength * 2, 0);
    sounds["endGame"][0].sound.volume = 1;
    sounds["endGame"][0].play();
    score++;
  }

  //location.reload();
  //sock.emit("connection", sock);
}

function freeze(){
  //if(status == "freeze"){
  console.log("is frozen");
  document.removeEventListener('keydown', userPressedKey);
  document.removeEventListener('keyup', userReleasedKey);
  //}
  //else if(status == "unFreeze"){
  setTimeout(function(){
    document.addEventListener('keydown', userPressedKey);
    document.addEventListener('keyup', userReleasedKey);
  }, 1000);

  //}
}
function setup(){
  console.log("here");
  colorChosen = document.getElementById("color");
  color = colorChosen.value;
  standing.src = "images/" + color + " Wizard Standing.png";
  shooting.src = "images/" + color + " Wizard Shooting.png";
  fireball1.src = "images/Fireball " + color + " 1.png";
  fireball2.src = "images/Fireball " + color + " 2.png";
  barrierImg.src = "images/" + color+ " barrier.png";

  xPos;
  yPos;
  spriteWidth = 100;
  spriteHeight = 100;
  enemyX;
  enemyY;
  barrier;
  enemyBarrier;
  action = "STANDING";
  enemyAction = "STANDING";
  fireballs = [];
  enemyFireballs = [];
  health;
  gameLost = false;

  backMusic = new Sound("audio/Epic Battle.mp3");
  backMusic.sound.loop = true;
  backMusic.sound.volume = 0.4;

  canvas = document.getElementById('canvas1');
  ctx = canvas.getContext('2d');
  canvas2 = document.getElementById('canvas2');
  ctx2 = canvas2.getContext('2d');
}

function drawScore(){
  ctx.font = "35px Verdana"
  ctx.textAlign = 'left'; //bases the poition of the text from the top left corner
  ctx.textBaseline = 'top';
  ctx.lineWidth = 5;
  ctx.strokeStyle = "black";

  var length = ctx.measureText(score).width;
  ctx.strokeText(score, 0 - length*2, -h/2 + 20);
  ctx.fillStyle = color;
  ctx.fillText(score, 0 - length*2, -h/2 + 20);

  ctx.fillStyle = "white";
  ctx.strokeText(":", 0, -h/2 + 20);
  ctx.fillText(":", 0, -h/2 + 20);

  ctx.fillStyle = enemyColor + "";
  console.log(enemyColor);
  length = ctx.measureText(enemyScore).width;
  ctx.strokeText(enemyScore, 0 + length*2, -h/2 + 20);
  ctx.fillText(enemyScore, 0 + length*2, -h/2 + 20);


}
