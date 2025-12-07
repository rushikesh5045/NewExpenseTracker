const { HTTP_STATUS } = require("../constants");

const sendResponse = (res, statusCode, data, message = null) => {
  const response = {
    success: statusCode < 400,
  };

  if (message) {
    response.message = message;
  }

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendSuccess = (
  res,
  data = null,
  message = null,
  statusCode = HTTP_STATUS.OK
) => {
  return sendResponse(res, statusCode, data, message);
};

const sendCreated = (res, data = null, message = "Created successfully") => {
  return sendResponse(res, HTTP_STATUS.CREATED, data, message);
};

const sendNoContent = (res) => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendError,
};
