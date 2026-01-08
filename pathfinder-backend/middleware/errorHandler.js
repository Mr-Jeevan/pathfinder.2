const errorHandler = (err, req, res, next) => {
  // Log for the developer
  console.error(`[ERROR] ${req.method} ${req.url}`);
  console.error(err.stack);

  // Determine status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    // Only show stack trace in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;