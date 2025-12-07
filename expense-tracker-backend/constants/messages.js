const MESSAGES = {
  // Auth
  AUTH: {
    USER_EXISTS: "User already exists",
    INVALID_CREDENTIALS: "Invalid email or password",
    REGISTER_SUCCESS: "User registered successfully",
    USER_NOT_FOUND: "User not found",
    NOT_AUTHORIZED: "Not authorized",
    TOKEN_REQUIRED: "Not authorized, no token",
    TOKEN_FAILED: "Not authorized, token failed",
    EMAIL_REQUIRED: "Email is required",
    TOKEN_PASSWORD_REQUIRED: "Token and password are required",
    INVALID_TOKEN: "Invalid or expired token",
    PASSWORD_RESET_EMAIL_SENT:
      "If your email is registered, you will receive a password reset link",
    PASSWORD_RESET_SUCCESS: "Password reset successful",
    EMAIL_SEND_FAILED: "Failed to send email. Please try again",
    PASSWORD_UPDATED: "Password updated successfully",
    CURRENT_PASSWORD_INCORRECT: "Current password is incorrect",
  },

  // Transaction
  TRANSACTION: {
    NOT_FOUND: "Transaction not found",
    NOT_AUTHORIZED_ACCESS: "Not authorized to access this transaction",
    NOT_AUTHORIZED_UPDATE: "Not authorized to update this transaction",
    NOT_AUTHORIZED_DELETE: "Not authorized to delete this transaction",
    REMOVED: "Transaction removed",
    REQUIRED_FIELDS: "Please provide amount, type and category",
    INVALID_AMOUNT: "Amount must be a positive number",
    INVALID_TYPE: "Type must be either income or expense",
  },

  // Category
  CATEGORY: {
    NOT_FOUND: "Category not found",
    EXISTS: "Category with this name already exists",
    DEFAULT_CANNOT_MODIFY: "Default categories cannot be modified",
    DEFAULT_CANNOT_DELETE: "Default categories cannot be deleted",
    NOT_AUTHORIZED_UPDATE: "Not authorized to update this category",
    NOT_AUTHORIZED_DELETE: "Not authorized to delete this category",
    REMOVED: "Category removed",
    REQUIRED_FIELDS: "Please provide all required fields",
  },

  // User
  USER: {
    NOT_FOUND: "User not found",
    EMAIL_IN_USE: "Email already in use",
    ACCOUNT_DELETED: "Account deleted successfully",
  },

  // Data Export
  DATA: {
    INVALID_FORMAT: "Invalid export format. Use pdf or csv",
    NO_TRANSACTIONS: "No transactions found for export",
  },

  // Generic
  SERVER_ERROR: "Server error",
  INVALID_REQUEST: "Invalid request data",
  RESOURCE_NOT_FOUND: "Resource not found",
};

module.exports = MESSAGES;
