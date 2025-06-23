import { DocumentService } from "../services/document.service.js";

export const DocumentController = {
    getMyDocuments: async (req, res) => {
        const docs = await DocumentService.getDocumentsByUserId(req.user.id);
        res.json(docs);
    },

    uploadDocument: async (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'Archivo no enviado' });

        const userId = req.body.user_id ? parseInt(req.body.user_id) : req.user.id;

        const doc = await DocumentService.createDocument({
            filename: req.file.originalname,
            path: `uploads/${req.file.filename}`,
            size: req.file.size,
            description: req.body.description || '',
            userId: userId
        });

        res.status(201).json(doc);
    },

    updateDescription: async (req, res) => {
        const { description } = req.body;
        const updated = await DocumentService.updateDescription(req.document.id, description);
        res.json(updated);
    },

    deleteDocument: async (req, res) => {
        await DocumentService.deleteDocument(req.document);
        res.sendStatus(204);
    },

    downloadDocument: async (req, res) => {
        const filePath = `${req.document.path}`;
        res.download(filePath, req.document.name);
    }
};