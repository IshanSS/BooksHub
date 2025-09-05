const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to authenticate the user
const authenticate = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user to the request object
      req.user = await User.findById(decoded._id).select("-password");

      if (!req.user) {
        return res.status(404).json({
          status: "Failed",
          message: "User not found. The token might be invalid.",
        });
      }

      next();
    } catch (error) {
      res.status(401).json({
        status: "Failed",
        message: "Not authorized, token failed",
      });
    }
  } else {
    res.status(401).json({
      status: "Failed",
      message: "Not authorized, no token",
    });
  }
};

module.exports = authenticate;
