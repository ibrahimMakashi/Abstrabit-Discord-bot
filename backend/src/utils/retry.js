export const calculateRetryDelay = (attempt) => {
  const baseDelayMs = 30 * 1000;
  const maxDelayMs = 30 * 60 * 1000;
  return Math.min(baseDelayMs * 2 ** Math.max(attempt - 1, 0), maxDelayMs);
};
