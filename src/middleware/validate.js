import { validationResult } from "express-validator";

// Middleware function to validate request
const validate = (req, res, next) => {
  // Check if any errors exist
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

export default validate;
