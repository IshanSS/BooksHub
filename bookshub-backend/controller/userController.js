const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const calculateSimilarity = require("../utils/recommendation");
const uploadOnCloudinary = require("../utils/cloudinary");

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

    let profilePicUrl = "";
    console.log("registerUser: req.file:", req.file);
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      console.log("registerUser: uploadResult:", uploadResult);
      if (uploadResult && (uploadResult.secure_url || uploadResult.url)) {
        profilePicUrl = uploadResult.secure_url || uploadResult.url;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
      location,
      profilePic: profilePicUrl,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
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
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const { _id, name, email: userEmail, role } = user;
    console.log("Login successful");
    console.log(user);

    res
      .status(200)
      .json({ user: { _id, name, email: userEmail, role }, token });
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
    console.log("getProfile: req.user:", req.user);
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "User not found. The token might be invalid.",
      });
    }
    res.json(user);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const getUserRecommendation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("postedBooks");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Collect base books (posted + wishlist)
    const wishlistBooks = await Book.find({ wishListedBy: user._id });
    const baseBooks = [...user.postedBooks, ...wishlistBooks];

    if (baseBooks.length === 0) {
      // fallback: random books
      const fallback = await Book.find({ isSold: false }).limit(5);
      return res.json({ recommendations: fallback, accuracy: null });
    }

    // All other available books
    const allBooks = await Book.find({
      isSold: false,
      owner: { $ne: user._id },
    });

    let scored = [];
    baseBooks.forEach((userBook) => {
      allBooks.forEach((b) => {
        const score = calculateSimilarity(userBook, b);
        scored.push({ book: b, score });
      });
    });

    // Sort by score desc
    scored.sort((a, b) => b.score - a.score);

    // Remove duplicates (keep highest score per book)
    const unique = Array.from(
      new Map(scored.map((s) => [s.book._id.toString(), s])).values()
    );

    // Top 5 recommendations
    const recommendations = unique.slice(0, 5);

    // Accuracy = avg similarity of recommendations
    const accuracy =
      recommendations.reduce((acc, r) => acc + r.score, 0) /
      (recommendations.length || 1);

    res.json({
      recommendations: recommendations.map((r) => r.book),
      accuracy: accuracy.toFixed(2), // 0–1 scale
    });
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
