import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller.js';
import { authMiddleware, isAdminOrOwner } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/my-documents', DocumentController.getMyDocuments);
router.post('/upload-document', upload.single('file'), DocumentController.uploadDocument);
router.put('/documents/:id/description', isAdminOrOwner, DocumentController.updateDescription);
router.delete('/documents/:id', isAdminOrOwner, DocumentController.deleteDocument);
router.get('/documents/:id/download', isAdminOrOwner, DocumentController.downloadDocument);

export default router;
