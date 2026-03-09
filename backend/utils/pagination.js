/**
 * Build pagination object to attach to query
 * @param {number} page
 * @param {number} limit
 * @returns {{ skip: number, limit: number }}
 */
const paginate = (page = 1, limit = 20) => ({
    skip: (Math.max(1, Number(page)) - 1) * Number(limit),
    limit: Math.min(Number(limit), 100), // cap at 100
});

/**
 * Build pagination metadata for API response
 */
const paginateMeta = (total, page, limit) => ({
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / Number(limit)),
    hasNext: Number(page) < Math.ceil(total / Number(limit)),
    hasPrev: Number(page) > 1,
});

module.exports = { paginate, paginateMeta };
