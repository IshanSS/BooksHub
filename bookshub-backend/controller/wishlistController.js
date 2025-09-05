const Book = require("../models/book");

// @desc Add book to wishlist
const addToWishList = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        status: "Failed",
        message: "Book not found",
      });
    }

    if (
      !book.wishListedBy
        .map((id) => id.toString())
        .includes(req.user._id.toString())
    ) {
      book.wishListedBy.push(req.user._id);
      await book.save();
    }

    res.json({
      status: "Success",
      message: "Book added to wishlist",
      bookId: book._id,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// @desc Remove book from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        status: "Failed",
        message: "Book not found",
      });
    }

    book.wishListedBy = book.wishListedBy.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await book.save();
    res.json({
      status: "Success",
      message: "Book removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// @desc Get wishlist of logged-in user
const getWishList = async (req, res) => {
  try {
    const books = await Book.find({ wishListedBy: req.user._id }).populate(
      "owner",
      "name college location"
    );
    res.json(books);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

module.exports = { addToWishList, removeFromWishlist, getWishList };
