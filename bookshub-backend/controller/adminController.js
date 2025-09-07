const User = require("../models/user");
const Book = require("../models/book");
const Review = require("../models/review");

// Get all users (only users with role 'user')
const getAllUsers = async (req, res) => {
  try {
    // Only return users with role 'user'
    const users = await User.find({ role: "user" }).select("-password");
    res.json(users);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// delete a user
const deleteuser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// change user role
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();
    res.json({ message: "User role updated", user });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// Get all books
const getAllBooks = async (req, res) => {
  try {
    // Return all book details, including imageUrl and all fields
    const books = await Book.find({})
      .populate("owner", "name email profilePic role")
      .lean();
    res.json(books);
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

// Delete a book
const deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("book", "title");
    res.json(reviews);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: "user" });
    const bookCount = await Book.countDocuments();
    const reviewCount = await Review.countDocuments();
    const soldBookCount = await Book.countDocuments({ isSold: true });
    res.json({
      userCount,
      bookCount,
      reviewCount,
      soldBookCount,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  deleteuser,
  changeUserRole,
  getAllBooks,
  deleteBook,
  getAllReviews,
  deleteReview,
  getStatistics,
};
