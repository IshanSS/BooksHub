const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    status: "Failed",
    message: "Admin access required",
  });
};

module.exports = isAdmin;
