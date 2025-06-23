import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller.js';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(authMiddleware, requireRole('admin'));

router.post('/upload-document', upload.single('file'), DocumentController.uploadDocument)
router.get('/statistics', UserController.getGlobalStatistics)
export default router;
