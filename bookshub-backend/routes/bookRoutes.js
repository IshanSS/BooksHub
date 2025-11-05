const express = require("express");
const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  markAsSold,
  recommendBooks,
} = require("../controller/bookController");
const authenticate = require("../middleware/jwtMiddleware");
const { upload } = require("../middleware/multerMiddleware");
const Book = require("../models/book"); // <-- add this line so Book is defined

const router = express.Router();

router.post("/", authenticate, upload.single("bookImage"), addBook);
// GET /api/books  (public listing) — only show admin-approved books
router.get("/", async (req, res) => {
  try {
    // public listing: only approved books (or legacy records without flag)
    const filters = {
      $or: [{ isApproved: true }, { isApproved: { $exists: false } }],
    };

    // preserve any existing query params (search/tag/etc.) if present
    // ...existing query parsing (if your file already supports query filters, merge them into `filters`) ...

    const books = await Book.find(filters).sort({ createdAt: -1 }).lean();
    return res.json(books);
  } catch (err) {
    console.error("Books list error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Could not fetch books" });
  }
});
router.get("/:id", getBookById);
router.put("/:id", authenticate, updateBook);
router.delete("/:id", authenticate, deleteBook);
router.patch("/:id/sold", authenticate, markAsSold);
router.get("/:id/recommend", recommendBooks);

module.exports = router;
