import { Router } from 'express';
import { getUsers, searchUsers } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getUsers);
router.get('/search', authenticate, searchUsers);

export default router;
