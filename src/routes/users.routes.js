import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware, requireRole('admin'));

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.post('/', validate(createUserSchema), UserController.create);
router.put('/:id', validate(updateUserSchema), UserController.update);
router.delete('/:id', UserController.delete);
router.get('/:id/documents', UserController.getDocuments);

export default router;
