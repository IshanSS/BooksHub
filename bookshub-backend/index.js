const app = require("./app");
const http = require("http");

const { Server } = require("socket.io");

const { PORT } = require("./config");

require("./dbConnection/dbConnection").connect();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
console.log("Socket.IO server initialized");

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendMessage", (data) => {
    // Broadcast the message to the recipient (or all, as needed)
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = { io };
