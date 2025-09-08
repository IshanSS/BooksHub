const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  getAllUsersExceptMe,
  updateProfile,
} = require("../controller/userController");
const { upload } = require("../middleware/multerMiddleware");
const authenticate = require("../middleware/jwtMiddleware");

const router = express.Router();

router.post("/register", upload.single("profilePic"), registerUser);

router.post("/login", loginUser);

// Update user profile
router.put(
  "/profile",
  authenticate,
  upload.single("profilePic"),
  updateProfile
);
router.get("/profile", authenticate, getProfile);

// Book recommendations for current user
router.get(
  "/recommendations",
  authenticate,
  require("../controller/userController").getUserRecommendation
);

// Get all users except the current user
router.get("/users", authenticate, getAllUsersExceptMe);

module.exports = router;
