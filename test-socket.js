const { io } = require("socket.io-client");
const socket = io("http://localhost:3000", { transports: ['websocket'] });
socket.on("connect", () => {
  console.log("Connected!");
  socket.emit("JOIN_ROOM", "TESTROOM");
  setTimeout(() => process.exit(0), 1000);
});
socket.on("connect_error", (err) => {
  console.log("Connect error:", err.message);
  process.exit(1);
});
