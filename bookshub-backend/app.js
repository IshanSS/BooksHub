// (moved resendVerification require/use below)
// (moved verifyRoutes require/use below)
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

const reviewRoutes = require("./routes/reviewRoutes");

const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/wishlist", wishListRoutes);

app.use("/api/books", bookRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);

const verifyRoutes = require("./routes/verifyRoutes");
app.use("/api", verifyRoutes);

const resendVerification = require("./routes/resendVerification");
app.use("/api", resendVerification);

module.exports = app;
