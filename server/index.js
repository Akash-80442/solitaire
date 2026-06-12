const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// In-memory store: Map<RoomCode, { createdAt: number }>
const rooms = new Map();

// Helper to generate a 6-character alphanumeric code
const generateRoomCode = () => {
  let code;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (rooms.has(code));
  return code;
};

// Cleanup stale rooms (older than 2 hours)
const cleanupStaleRooms = () => {
  const now = Date.now();
  for (const [code, data] of rooms.entries()) {
    if (now - data.createdAt > 2 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
};
setInterval(cleanupStaleRooms, 15 * 60 * 1000); // Run every 15 mins

// HTTP endpoints for legacy compatibility / simple room generation
app.post('/room/create', (req, res) => {
  const code = generateRoomCode();
  rooms.set(code, { createdAt: Date.now() });
  
  console.log(`Created Room: ${code}`);
  res.json({ roomCode: code });
});

app.get('/room/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  if (!rooms.has(code)) {
    return res.status(404).json({ error: 'Room not found or expired' });
  }
  res.json({ ip: 'server-relay' }); // Dummy IP since we are now using web sockets
});

// Socket.io integration
io.on('connection', (socket) => {
  // Join a specific room
  socket.on('JOIN_ROOM', (roomCode) => {
    socket.join(roomCode);
    console.log(`Socket ${socket.id} joined room ${roomCode}`);
  });

  // Leave a specific room
  socket.on('LEAVE_ROOM', (roomCode) => {
    socket.leave(roomCode);
    console.log(`Socket ${socket.id} left room ${roomCode}`);
  });

  // Relay generic game messages to everyone else in the room
  // Payload should include { type: string, ...data }
  socket.on('GAME_MESSAGE', ({ roomCode, payload }) => {
    socket.to(roomCode).emit('GAME_MESSAGE', payload);
  });
  
  socket.on('disconnect', () => {
    // console.log(`Socket ${socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Matchmaking Server & WebSocket Relay running on port ${PORT} and bound to all interfaces`);
});
