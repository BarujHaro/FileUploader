const { body } = require("express-validator");

const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email"),

  body("pass")
    .notEmpty().withMessage("Password is required")
];

module.exports = validateLogin;