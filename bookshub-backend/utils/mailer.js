// utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // App password (not your Gmail password)
  },
});

function sendVerificationEmail(to, token) {
  const verificationUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/verify-email?token=${token}`;
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your BooksHub account",
    html: `<p>Thank you for signing up! Please verify your email by clicking the link below:</p><a href="${verificationUrl}">Verify Email</a>`,
  });
}

module.exports = { sendVerificationEmail };
