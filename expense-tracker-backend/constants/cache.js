const CACHE_KEYS = {
  CATEGORIES: (userId) => `categories:${userId}`,
  TRANSACTION_SUMMARY: (userId, startDate, endDate) =>
    `summary:${userId}:${startDate || "all"}:${endDate || "all"}`,
  USER_PROFILE: (userId) => `user:${userId}`,
};

const CACHE_TTL = {
  CATEGORIES: 3600, // 1 hour
  TRANSACTION_SUMMARY: 300, // 5 minutes
  USER_PROFILE: 1800, // 30 minutes
};

module.exports = {
  CACHE_KEYS,
  CACHE_TTL,
};
