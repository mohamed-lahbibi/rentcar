const { PAGINATION } = require('../config/constants');

// Parse pagination params
const parsePagination = (query) => {
  let page = parseInt(query.page) || PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT;
  
  // Ensure valid values
  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), PAGINATION.MAX_LIMIT);
  
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

// Generate pagination metadata
const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

// Paginated response
const paginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: getPaginationMeta(total, page, limit)
  };
};

module.exports = {
  parsePagination,
  getPaginationMeta,
  paginatedResponse
};
