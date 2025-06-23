import { UserService } from "../services/user.service.js";
import { DocumentService } from "../services/document.service.js";


export const UserController = {
    getAll: async (req, res) => {
        const users = await UserService.getAllUsers();
        res.json(users);
    },

    getById: async (req, res) => {
        const id = parseInt(req.params.id);
        const user = await UserService.getUserById(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    },

    create: async (req, res) => {
        const newUser = await UserService.createUser(req.body);
        res.status(201).json(newUser);
    },

    update: async (req, res) => {
        const id = parseInt(req.params.id);
        const updated = await UserService.updateUser(id, req.body);
        res.json(updated);
    },

    delete: async (req, res) => {
        const id = parseInt(req.params.id);
        await UserService.deleteUser(id);
        res.status(204).send();
    },

    getDocuments: async (req, res) => {
        const id = parseInt(req.params.id);
        const documents = await UserService.getDocuments(id);
        res.json(documents);
    },

    getGlobalStatistics: async (req, res) => {
        const users = await UserService.getAllUsers();
        const documents = await DocumentService.getAllDocuments();
        const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);

        res.json({
            "totalUsers": users.length,
            "totalDocuments": documents.length,
            "totalSize": totalSize
        });
    },

    getStatistics: async (req, res) => {
        const id = parseInt(req.user.id);
        const documents = await UserService.getDocuments(id);
        const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);

        res.json({
            "userDocuments": documents.length,
            "userTotalSize": totalSize
        });
    }
}

