import mongoSanitize from 'express-mongo-sanitize';

const sanitizeObject = (value, options) => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  mongoSanitize.sanitize(value, options);
  return value;
};

export const mongoSanitizeMiddleware = (options = {}) => (req, res, next) => {
  sanitizeObject(req.body, options);
  sanitizeObject(req.params, options);
  sanitizeObject(req.headers, options);
  sanitizeObject(req.query, options);
  next();
};
