function Sound(src){

  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto"); //user downloads the whole audio file
  this.sound.setAttribute("controls", "none"); //user has not controls for audio
  this.sound.style.display = "none";
  
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}
