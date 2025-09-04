const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// @desc Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, college, location } = req.body;

    if (!name || !email || !password || !college || !location) {
      return res.status(400).json({
        status: "Failed",
        messgae: "All fields are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: "Failed",
        message: "User with the same email address already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
      location,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// @desc Login user and generate JWT
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const { _id, name, email: userEmail, role } = user;

    res
      .status(200)
      .json({ user: { id: _id, name, email: userEmail, role }, token });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// @desc Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
