export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  if (error.code === 11000) {
    return res.status(409).json({ message: "A record with that value already exists." });
  }

  const status = error.statusCode || 500;
  return res.status(status).json({
    message: error.message || "Something went wrong.",
    ...(error.details && { errors: error.details }),
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
}

