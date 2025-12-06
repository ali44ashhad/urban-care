 // src/utils/paginator.js
/**
 * Helper to compute skip/limit and return metadata
 * Usage: const { skip, limit, meta } = paginate(req.query);
 */
function paginate(query = {}) {
  const page = Math.max(1, parseInt(query.page || 1, 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || 20, 10)));
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    skip,
    meta: (total) => ({
      page,
      limit,
      total,
      totalPages: Math.ceil((total || 0) / limit)
    })
  };
}

module.exports = { paginate };
