const express = require("express");
const {
  addToWishList,
  removeFromWishlist,
  getWishList,
} = require("../controller/wishlistController");
const authenticate = require("../middleware/jwtMiddleware");

const router = express.Router();

router.get("/", authenticate, getWishList);
router.post("/:bookId", authenticate, addToWishList);
router.delete("/:bookId", authenticate, removeFromWishlist);

module.exports = router;
