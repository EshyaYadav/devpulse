const { Server } = require('socket.io');

let io;

function initSockets(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*", // allow all for local dev, specific origin for prod
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.io initialized.');
}

function getIo() {
  return io;
}

module.exports = { initSockets, getIo };
