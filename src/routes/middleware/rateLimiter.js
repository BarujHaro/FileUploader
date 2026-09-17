const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // Bloquea después de 5 intentos fallidos
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).render("login", {
        title: "Login",
        error: "Too many login attempts. Try again in 15 minutes."
    });
  }

});

module.exports = { loginLimiter };