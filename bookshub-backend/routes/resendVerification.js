const express = require("express");
const router = express.Router();
const User = require("../models/user");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/mailer");

// POST /api/resend-verification
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found." });
  if (user.isVerified)
    return res.status(400).json({ message: "User already verified." });
  // Generate new token
  user.verificationToken = crypto.randomBytes(32).toString("hex");
  user.verificationTokenExpires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  await user.save();
  console.log(
    `[Resend] Email: ${user.email}, Token: ${user.verificationToken}`
  );
  await sendVerificationEmail(user.email, user.verificationToken);
  res.json({ message: "Verification email resent. Please check your inbox." });
});

module.exports = router;
