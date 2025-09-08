const express = require("express");
const router = express.Router();
const User = require("../models/user");

// GET /api/verify-email?token=...
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  console.log(`[Verify] Token received: ${token}`);
  if (!token) {
    console.log("[Verify] No token provided");
    return res.status(400).json({ message: "Invalid verification link." });
  }
  let user = await User.findOne({ verificationToken: token });
  console.log(`[Verify] User found:`, user ? user.email : null);
  if (!user) {
    // Try to find by token in the past (already verified?)
    user = await User.findOne({
      isVerified: true,
      verificationToken: { $exists: false },
    });
    if (user) {
      console.log("[Verify] User already verified:", user.email);
      return res
        .status(200)
        .json({ message: "Your email is already verified. Please log in." });
    }
    console.log("[Verify] No user found for token");
    return res
      .status(400)
      .json({ message: "Invalid or expired verification link." });
  }
  if (
    user.verificationTokenExpires &&
    user.verificationTokenExpires < Date.now()
  ) {
    console.log("[Verify] Token expired for user:", user.email);
    return res.status(400).json({
      message: "Verification link has expired. Please request a new one.",
    });
  }
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();
  console.log(`[Verify] User ${user.email} verified successfully.`);
  res.json({ message: "Email verified! You can now log in." });
});

module.exports = router;
