// src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};
