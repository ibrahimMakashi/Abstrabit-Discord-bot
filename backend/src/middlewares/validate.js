export const validate = (schema, target = 'body') => (req, res, next) => {
  const parsed = schema.parse(req[target]);
  req.validated = { ...req.validated, [target]: parsed };
  next();
};
