const express = require("express");

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

module.exports = router;
