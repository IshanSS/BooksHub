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

// Add CSP header to allow Khalti to be framed and to allow khalti scripts/connections.
// This permits Khalti iframe and avoids "Refused to frame" due to frame-ancestors 'self'.
app.use((req, res, next) => {
  // Only set CSP on HTML pages / all responses — adjust if you serve other resources that need different CSP.
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

// register payment routes
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

module.exports = app;
