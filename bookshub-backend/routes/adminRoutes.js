const express = require("express");
const jwt = require("jsonwebtoken");
const Book = require("../models/book"); // <-- add this line so Book is defined for approve/reject handlers

const {
  getAllUsers,
  deleteuser,
  changeUserRole,
  getAllBooks,
  deleteBook,
  getAllReviews,
  deleteReview,
  getStatistics,
} = require("../controller/adminController");

const authenticate = require("../middleware/jwtMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// user management routes
router.get("/users", authenticate, isAdmin, getAllUsers);
router.delete("/users/:id", authenticate, isAdmin, deleteuser);
router.patch("/users/:id/role", authenticate, isAdmin, changeUserRole);

// Book management routes
router.get("/books", authenticate, isAdmin, getAllBooks);
router.delete("/books/:id", authenticate, isAdmin, deleteBook);

// Review management routes
router.get("/reviews", authenticate, isAdmin, getAllReviews);
router.delete("/reviews/:id", authenticate, isAdmin, deleteReview);

// Statistics route
router.get("/statistics", authenticate, isAdmin, getStatistics);

// Admin-only: list all books (including pending/unapproved) for review
router.get("/books", authenticate, isAdmin, getAllBooks);

// Admin-only: mark a book as approved (isApproved = true)
router.post("/books/:id/approve", authenticate, isAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    const updated = await Book.findByIdAndUpdate(
      id,
      { $set: { isApproved: true } },
      { new: true }
    ).lean();
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    return res.json({ success: true, book: updated });
  } catch (err) {
    console.error("Approve book error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not approve book",
      detail: err.message || err,
    });
  }
});

// Admin-only: mark a book as rejected (isRejected = true, isApproved = false)
router.post("/books/:id/reject", authenticate, isAdmin, async (req, res) => {
  const id = req.params.id;
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Book id required" });
  try {
    const updated = await Book.findByIdAndUpdate(
      id,
      { $set: { isRejected: true, isApproved: false } },
      { new: true }
    ).lean();
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    return res.json({ success: true, book: updated });
  } catch (err) {
    console.error("Reject book error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not reject book",
      detail: err.message || err,
    });
  }
});

// Admin-only: delete book
router.delete("/books/:id", authenticate, isAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    const doc = await Book.findByIdAndDelete(id).lean();
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    return res.json({ success: true, message: "Book deleted", book: doc });
  } catch (err) {
    console.error("Admin delete book error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not delete book",
      detail: err.message || err,
    });
  }
});

module.exports = router;
