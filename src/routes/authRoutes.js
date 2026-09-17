import { Router } from 'express';
const authController = require("../controllers/authController");
const validateUser = require('../controllers/validators/userValidator');
const loginValidator = require('../controllers/validators/loginValidator');
const { loginLimiter } = require('./middleware/rateLimiter');
const {isAuth} = require('./middleware/Auth');
const router = Router();

router.get('/sign-up', authController.getSignUp);
router.post('/sign-up', validateUser, authController.postSignUp);
router.get('/login', authController.loginGet);
router.post('/login', loginLimiter, loginValidator, authController.loginPost);
router.get("/logout", isAuth, authController.logout);

export default router;