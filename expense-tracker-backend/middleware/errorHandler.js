const { HTTP_STATUS, MESSAGES } = require("../constants");
const { AppError, ValidationError } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || MESSAGES.SERVER_ERROR;
  let errors = null;

  if (err instanceof ValidationError) {
    errors = err.errors;
  }

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Invalid ID format";
  }

  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue)[0];
    message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = MESSAGES.AUTH.TOKEN_FAILED;
  }

  if (err.name === "TokenExpiredError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Token has expired";
  }

  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  } else {
    if (!err.isOperational) {
      console.error("Unexpected Error:", err);
      message = MESSAGES.SERVER_ERROR;
    }
  }

  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === "development" && !err.isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

const notFoundHandler = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFoundHandler };
