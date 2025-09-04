const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controller/userController");
const authenticate = require("../middleware/jwtMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", authenticate, getProfile);

module.exports = router;
