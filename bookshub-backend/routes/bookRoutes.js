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

const router = express.Router();

router.post("/", authenticate, upload.single("bookImage"), addBook);
router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.put("/:id", authenticate, updateBook);
router.delete("/:id", authenticate, deleteBook);
router.patch("/:id/sold", authenticate, markAsSold);
router.get("/:id/recommend", recommendBooks);

module.exports = router;
