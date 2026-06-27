// Response helper utilities

const successResponse = (data = null, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    data,
    message
  };
};

const errorResponse = (message = 'Error', statusCode = 400, error = null) => {
  return {
    success: false,
    statusCode,
    message,
    ...(error && { error: error.message })
  };
};

const paginatedResponse = (data, page, limit, total) => {
  return {
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

const sendError = (res, message = 'Error', statusCode = 400, error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(error && { error: error.message })
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  sendSuccess,
  sendError
};
