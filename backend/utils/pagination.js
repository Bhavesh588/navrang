// Pagination utilities

const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 10;

  // Validation
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100; // Max 100 per page

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
};

const calculatePagination = (total, page, limit) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };
};

module.exports = {
  getPaginationParams,
  calculatePagination
};
