const Review = require("../models/review");
const Book = require("../models/book");

// Add review
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        status: "Failed",
        message: "Book not found",
      });
    }

    // Prevent user from reviewing the same book multiple times
    const existingReview = await Review.findOne({
      user: req.user._id,
      book: bookId,
    });

    if (existingReview) {
      return res.status(400).json({
        status: "Failed",
        message: "You have already reviewed this book",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      book: bookId,
      rating,
      comment,
    });

    // Update book stats
    const reviews = await Review.find({ book: bookId });
    book.numReviews = reviews.length;
    book.averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await book.save();

    res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// Get all reviews for a book
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId }).populate(
      "user",
      "name email"
    );
    res.json(reviews);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only review owner or admin can delete
    if (
      review.user.toString() !== req.user._id.toString()
      // OR: add admin check here if you have roles
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();

    // Update book stats after deletion
    const reviews = await Review.find({ book: review.book });
    const book = await Book.findById(review.book);

    if (reviews.length > 0) {
      book.numReviews = reviews.length;
      book.averageRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    } else {
      book.numReviews = 0;
      book.averageRating = 0;
    }

    await book.save();

    res.json({ message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

module.exports = { addReview, getReviews, deleteReview };
