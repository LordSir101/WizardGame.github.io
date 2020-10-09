<html>
<head>
  <title>Wizard Game</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css" />

</head>

<body>
  <div id="container">
    <canvas id="canvas1" class="canvas" width="600px" height="850px"></canvas>
    <canvas id="canvas2" class="canvas" width="600px" height="850px"></canvas>

  </div>

  <div class="general">
    <label for="color" id="colorLabel">Character Color</label><br>
    <select id="color">

    <option value='Blue'>Blue</option>
    <option value='Yellow'>Yellow</option>
    <option value='Green'>Green</option>
    <option value='Red'>Red</option>
   </select>
 </div>

  <button id ="startButton" onclick="start()"><span id="start" class="startStroke">Start</span></button><td>

  <script src="/socket.io/socket.io.js"></script>
  <script type="text/javascript" src="sound.js"></script>
  <script type="text/javascript" src="wizardGame.js"></script>
</body>
</html>
