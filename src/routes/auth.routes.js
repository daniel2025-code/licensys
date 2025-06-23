import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema } from '../schemas/login.schema.js';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', authMiddleware, AuthController.logout);

export default router;