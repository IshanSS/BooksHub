const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    college: { type: String, required: true },
    location: { type: String, required: true },
    profilePic: { type: String, default: "" },
    resetPasswordToken: { type: String, default: "" },
    verifyEmailToken: { type: String, default: "" },
    postedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
