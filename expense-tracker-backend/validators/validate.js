const { ValidationError } = require("../utils/errors");

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const dataToValidate = req[property];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      throw new ValidationError("Validation failed", errors);
    }

    req[property] = value;
    next();
  };
};

const validateBody = (schema) => validate(schema, "body");
const validateQuery = (schema) => validate(schema, "query");
const validateParams = (schema) => validate(schema, "params");

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
};
