// Middleware to allow only users with role 'user'
const isUser = (req, res, next) => {
  if (req.user && req.user.role === "user") {
    next();
  } else {
    return res.status(403).json({
      status: "Failed",
      message: "User access required",
    });
  }
};

module.exports = isUser;
