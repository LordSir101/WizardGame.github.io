const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Events = require('./serverEvents');

const app = express();

const clientPath = `${__dirname}/../client`; //Note you have to use these quotes ``
console.log(`serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);



var waitingPlayer = null;
io.on('connection', (sock) => {
  if(waitingPlayer){
    console.log("game started");
    new Events(waitingPlayer, sock);
    waitingPlayer = null;
  }
  else{
    console.log("waiting");
    waitingPlayer = sock;
  }

});
/*
io.on('newGame', (sock) => {
  game = null;
  if(waitingPlayer){
    game = new Events(waitingPlayer, sock);
    waitingPlayer = null;
  }
  else{
    waitingPlayer = sock;
  }*/


//server event listeners------------------------------------------------------------------
server.on('error', (err) =>{
  console.error('server error:' + err);
});

//School
//server.listen(3000, '205.211.159.164');

//Home
server.listen(3000, '192.168.46.1');
//To host, cd to C:\Users\100707158\Documents\ngrok-stable-windows-amd64 (1)
//ngrok http 192.168.46.1:3000 to get a link
