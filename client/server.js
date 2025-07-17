// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

app.use(express.json());

app.post("/broadcast", (req, res) => {
  console.log("Broadcasting event:", req.body); // <--- Add this
  io.emit("slack_event", req.body);
  res.sendStatus(200);
});

app.post("/facebook-message", (req, res) => {
  const { senderId, message } = req.body;

  console.log("Facebook message received:", senderId, message);
  io.emit("facebook_message", { senderId, message });

  res.sendStatus(200);
});

app.post("/facebook-message-seen", (req, res) => {
  const { senderId, seenAt } = req.body;

  console.log("Message seen event:", senderId, seenAt);
  io.emit("facebook_message_seen", { senderId, seenAt });

  res.sendStatus(200);
});

server.listen(4000, () => {
  console.log("WebSocket server running on port 4000");
});
