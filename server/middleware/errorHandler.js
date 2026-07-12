function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Server error";
  if (status >= 500) console.error(err);
  res.status(status).json({ detail: message });
}

module.exports = errorHandler;
