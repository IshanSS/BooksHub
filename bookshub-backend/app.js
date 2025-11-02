const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

// use a single CORS configuration (allow frontend origin)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set CSP header to allow Khalti frames and scripts (header overrides meta)
// Include frame-ancestors to explicitly allow Khalti framing if necessary.
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self' https:",
      "script-src 'self' 'unsafe-inline' https://khalti.com https://khalti.com/static https://*.khalti.com",
      "connect-src 'self' https://khalti.com https://*.khalti.com http: https:",
      "img-src 'self' data: https: http:",
      "style-src 'self' 'unsafe-inline' https:",
      "frame-src https://khalti.com https://*.khalti.com",
      "frame-ancestors 'self' https://khalti.com https://*.khalti.com",
    ].join("; ")
  );
  next();
});

const authRoutes = require("./routes/authRoutes");

const chatRoutes = require("./routes/chatRoutes");

const bookRoutes = require("./routes/bookRoutes");

const wishListRoutes = require("./routes/wishlistRoutes");

const reviewRoutes = require("./routes/reviewRoutes");

const adminRoutes = require("./routes/adminRoutes");

const paymentRoutes = require("./routes/paymentRoutes");

// register routes
app.use("/api/payment", paymentRoutes);
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

// keep a single export
module.exports = app;
