const Joi = require("joi");
const {
  TRANSACTION_TYPE_VALUES,
  EXPORT_FORMAT_VALUES,
} = require("../constants");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().min(8).max(128).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password cannot exceed 128 characters",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "Token is required",
  }),
  password: Joi.string().min(8).max(128).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
  }),
  newPassword: Joi.string().min(8).max(128).required().messages({
    "string.empty": "New password is required",
    "string.min": "New password must be at least 8 characters",
  }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),
  email: Joi.string().trim().email().lowercase().optional().messages({
    "string.email": "Please provide a valid email",
  }),
});

const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be a positive number",
    "any.required": "Amount is required",
  }),
  type: Joi.string()
    .valid(...TRANSACTION_TYPE_VALUES)
    .required()
    .messages({
      "any.only": "Type must be either income or expense",
      "any.required": "Type is required",
    }),
  category: Joi.string().required().messages({
    "string.empty": "Category is required",
  }),
  date: Joi.date().optional(),
  notes: Joi.string().trim().max(500).allow("").optional().messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
});

const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive().optional().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be a positive number",
  }),
  type: Joi.string()
    .valid(...TRANSACTION_TYPE_VALUES)
    .optional()
    .messages({
      "any.only": "Type must be either income or expense",
    }),
  category: Joi.string().optional(),
  date: Joi.date().optional(),
  notes: Joi.string().trim().max(500).allow("").optional().messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
});

const transactionQuerySchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  type: Joi.string()
    .valid(...TRANSACTION_TYPE_VALUES)
    .optional(),
  category: Joi.string().optional(),
});

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required().messages({
    "string.empty": "Category name is required",
    "string.max": "Category name cannot exceed 50 characters",
  }),
  type: Joi.string()
    .valid(...TRANSACTION_TYPE_VALUES)
    .required()
    .messages({
      "any.only": "Type must be either income or expense",
      "any.required": "Type is required",
    }),
  color: Joi.string().required().messages({
    "string.empty": "Color is required",
  }),
  icon: Joi.string().required().messages({
    "string.empty": "Icon is required",
  }),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).optional().messages({
    "string.max": "Category name cannot exceed 50 characters",
  }),
  color: Joi.string().optional(),
  icon: Joi.string().optional(),
});

const exportDataSchema = Joi.object({
  format: Joi.string().valid("pdf", "csv", "PDF", "CSV").required().messages({
    "any.only": "Format must be either pdf or csv",
    "any.required": "Export format is required",
  }),
  startDate: Joi.string().optional(),
  endDate: Joi.string().optional(),
});

const objectIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid ID format",
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  exportDataSchema,
  objectIdSchema,
};
