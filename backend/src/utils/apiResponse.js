// Standard API response
const apiResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Success response
const successResponse = (res, message, data = null, statusCode = 200) => {
  return apiResponse(res, statusCode, true, message, data);
};

// Error response
const errorResponse = (res, message, statusCode = 400) => {
  return apiResponse(res, statusCode, false, message);
};

// Created response
const createdResponse = (res, message, data = null) => {
  return apiResponse(res, 201, true, message, data);
};

// Not found response
const notFoundResponse = (res, resource = 'Resource') => {
  return apiResponse(res, 404, false, `${resource} not found`);
};

// Unauthorized response
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return apiResponse(res, 401, false, message);
};

// Forbidden response
const forbiddenResponse = (res, message = 'Access denied') => {
  return apiResponse(res, 403, false, message);
};

module.exports = {
  apiResponse,
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse
};
