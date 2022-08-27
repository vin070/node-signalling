let app = require("express")();
let { Server } = require("socket.io");
let fs = require("fs");
let https = require("https");
let { config } = require("./env/env");

//certificate path
let certificates = {
  cert: fs.readFileSync("./assets/keys/fullchain.pem"),
  key: fs.readFileSync("./assets/keys/privkey.pem"),
};

//start https server and listen on it
let server = https.createServer(certificates, app).listen(config.PORT);

// create socket.io and bind socket.io to this server
let io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//routing events listen
app.get("/", function (req, res, next) {
  res.send("welcome to signalling server");
  res.end();
});

//socket.io events
let connectedUser = [];

io.on("connection", function (socket) {
  socket.on("join", ({ email, room_name }) => {
    connectedUser.push({ email: email, socketId: socket.id });
    socket.join(room_name);
    socket.to(room_name).emit("room_join", { email: email });
  });

  socket.on("message", ({ room_name, data }) => {
    socket.to(room_name).emit("message", data);
  });

  socket.on("left", ({ room_name }) => {
    socket.leave(room_name);
  });
});
