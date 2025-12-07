const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { UnauthorizedError } = require("../utils/errors");
const { MESSAGES } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      throw new UnauthorizedError(MESSAGES.AUTH.USER_NOT_FOUND);
    }

    return next();
  }

  throw new UnauthorizedError(MESSAGES.AUTH.TOKEN_REQUIRED);
});

module.exports = { protect };
