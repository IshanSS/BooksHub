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

  // Store userId on socket for targeted emits
  socket.on("register", (userId) => {
    socket.userId = userId;
  });

  socket.on("sendMessage", async (data) => {
    // data: { from, to, content, fromName }
    try {
      const Message = require("./models/mesage");
      const message = await Message.create({
        from: data.from,
        to: data.to,
        content: data.content,
        fromName: data.fromName || "",
      });
      // Emit to recipient and sender only
      io.sockets.sockets.forEach((s) => {
        if (s.userId === data.to || s.userId === data.from) {
          s.emit("receiveMessage", message);
        }
      });
    } catch (err) {
      console.error("Socket sendMessage error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = { io };
