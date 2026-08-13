import { Router } from 'express';
import { 
    getSignUp, 
    postSignUp 
} from '../controllers/authController.js';

const router = Router();

router.get('/sign-up', getSignUp);
router.post('/sign-up', postSignUp);

export default router;