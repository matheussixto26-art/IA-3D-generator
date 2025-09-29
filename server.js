// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const players = {};

io.on('connection', (socket) => {
  players[socket.id] = { x: Math.random() * 20 - 10, y: 1, z: Math.random() * 20 - 10 };

  socket.emit('init', {
    id: socket.id,
    players: Object.entries(players).map(([id, pos]) => ({ id, ...pos }))
  });

  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  socket.on('move', (position) => {
    if (players[socket.id]) {
      players[socket.id] = position;
      io.emit('updatePositions', Object.entries(players).map(([id, pos]) => ({ id, ...pos })));
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    socket.broadcast.emit('removePlayer', socket.id);
  });
});

module.exports = app;
