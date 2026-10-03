import { Router } from 'express';
import * as authController from "../controllers/authController.js";
import {validateUser} from '../controllers/validators/userValidator.js';
import {validateLogin} from '../controllers/validators/loginValidator.js';
import {loginLimiter} from './middleware/rateLimiter.js';
import { isAuth } from './middleware/Auth.js';
const router = Router();

router.get('/sign-up', authController.getSignUp);
router.post('/sign-up', validateUser, authController.postSignUp);
router.get('/login', authController.loginGet);
router.post('/login', loginLimiter, validateLogin, authController.loginPost);
router.get('/logout', isAuth, authController.logout);

export default router; 