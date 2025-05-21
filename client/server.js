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

server.listen(4000, () => {
  console.log("WebSocket server running on port 4000");
});