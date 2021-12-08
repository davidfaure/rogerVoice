const path = require("path");
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const app = express();
const port = process.env.PORT || 8080; // usually in .env but not used here for test

const buildPath = path.join(__dirname, "..", "build");
app.use(express.static(buildPath));

const server = http.createServer(app);

const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
  },
});

const users = {};

io.on("connection", (socket) => {
  const chatRoom = "chatRoom";
  if (!users[socket.id]) {
    users[socket.id] = socket.id;
  }

  socket.on("join", (data) => {
    socket.join(data.room);
    socket.emit("welcome", {
      id: socket.id,
      username: data.userName,
      text: `Bienvenue ${data.userName}`,
      welcome: true,
    });

    socket.broadcast.to(data.room).emit("welcome", {
      id: socket.id,
      username: data.userName,
      text: `${data.userName} a rejoint le chat`,
      welcome: true,
    });
  });

  socket.on("typing", (data) => {
    if (data.typing) {
      socket.broadcast.emit("isTyping", {
        text: `${data.name} est en train d'écrire`,
      });
    } else {
      socket.broadcast.emit("isTyping", {
        text: "",
      });
    }
  });

  socket.on("chat", (text, username, roomName) => {
    io.to(roomName).emit("message", {
      id: socket.id,
      username,
      text,
      welcome: false,
    });
  });

  // send my id
  socket.emit("myId", socket.id, chatRoom);

  // send a notification that call is ended upon disconnect
  socket.on("disconnect", () => {
    delete users[socket.id];
  });

  socket.on("callEnded", () => {
    io.emit("stopCall");
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal, data.nameCaller);
  });
});

server.listen(port, () => console.log(`server is running on port ${port}`));
