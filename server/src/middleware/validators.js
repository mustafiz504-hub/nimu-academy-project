const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((/** @type {any} */ err) => extractedErrors.push({ [err.path || err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

/** Validation rules for POST /auth/signup/initiate */
const signupInitiateRules = () => [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('terms_agreed').custom((val) => {
    if (!val || val === 'false' || val === false) {
      throw new Error('You must agree to the Terms & Privacy Policy');
    }
    return true;
  }),
];

const loginInitiateRules = () => [
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

// ─── Legacy validators (kept for backward compat middleware references) ────────
const registerValidationRules = () => [];
const loginValidationRules = () => [];

module.exports = {
  validate,
  signupInitiateRules,
  loginInitiateRules,
  // Legacy exports (no-ops now)
  registerValidationRules,
  loginValidationRules,
};
