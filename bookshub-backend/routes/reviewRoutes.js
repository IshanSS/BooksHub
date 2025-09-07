const express = require("express");
const {
  addReview,
  getReviews,
  deleteReview,
} = require("../controller/reviewController");
const authenticate = require("../middleware/jwtMiddleware");

const router = express.Router();

router.post("/:bookId/reviews", authenticate, addReview);
router.get("/:bookId/reviews", getReviews);
router.delete("/:bookId/reviews/:reviewId", authenticate, deleteReview);

module.exports = router;
