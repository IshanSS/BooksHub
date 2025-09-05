const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controller/userController");
const { upload } = require("../middleware/multerMiddleware");
const authenticate = require("../middleware/jwtMiddleware");

const router = express.Router();

router.post("/register", upload.single("profilePic"), registerUser);

router.post("/login", loginUser);

router.get("/profile", authenticate, getProfile);

module.exports = router;
