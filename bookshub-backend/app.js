const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");

const chatRoutes = require("./routes/chatRoutes");

const bookRoutes = require("./routes/bookRoutes");

const wishListRoutes = require("./routes/wishlistRoutes");

app.use("/api/wishlist", wishListRoutes);

app.use("/api/books", bookRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);

module.exports = app;
