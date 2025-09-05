const Book = require("../models/book");
const { levenshteinDistance } = require("../utils/levenshtein");
const uploadOnCloudinary = require("../utils/cloudinary");

// @desc Add a new book
const addBook = async (req, res) => {
  try {
    const {
      bookName,
      subject,
      price,
      condition,
      author,
      priceType,
      mrp,
      branch,
      noOfPages,
      edition,
      description,
      tags,
    } = req.body;

    let imageUrl = "";
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (uploadResult && (uploadResult.secure_url || uploadResult.url)) {
        imageUrl = uploadResult.secure_url || uploadResult.url;
      }
    }

    const book = await Book.create({
      bookName,
      subject,
      price,
      condition,
      author,
      priceType,
      mrp,
      branch,
      noOfPages,
      edition,
      description,
      imageUrl,
      tags,
      owner: req.user._id,
    });
    res.status(201).json(book);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// @desc Get all Books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({ isSold: false }).populate(
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

// @desc Get a single book
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "owner",
      "name college location"
    );
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// @desc Update book
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        status: "Failed",
        message: "Books not found",
      });
    }

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "Failed",
        message: "Not authorized to edit this book",
      });
    }

    Object.assign(book, req.body);
    const updatedBook = await book.save();

    res.json(updatedBook);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// @desc Delete book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        status: "Failed",
        message: "Book not found",
      });
    }

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "Failed",
        message: "Not authorized to delete this book",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// @desc Mark book as sold
const markAsSold = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(500).json({
        status: "Failed",
        message: "Book not found",
      });
    }

    if (book.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to mark this book" });
    }

    book.isSold = true;
    await book.save();
    res.json({ message: "Book marked as sold" });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// @desc Recommend similar books using Levenstein distance
const recommendBooks = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        status: "Failed",
        message: "Book not found",
      });
    }

    const allBooks = await Book.find({ _id: { $ne: book._id }, isSold: false });

    const distances = allBooks.map((b) => ({
      book: b,
      distance: levenshteinDistance(book.bookName, b.bookName),
    }));

    distances.sort((a, b) => a.distance - b.distance);

    res.json(distances.slice(0, 5).map((d) => d.book));
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  markAsSold,
  recommendBooks,
};
