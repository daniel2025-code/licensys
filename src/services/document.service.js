import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import fs from 'fs/promises';

export const DocumentService = {
    getDocumentsByUserId: (userId) =>
        prisma.document.findMany({ where: { userId } }),

    createDocument: ({ filename, path, size, description, userId }) =>
        prisma.document.create({ data: { filename, path, size, description, userId } }),

    updateDescription: (id, description) =>
        prisma.document.update({ where: { id }, data: { description } }),

    deleteDocument: async (document) => {
        await fs.unlink(`${document.path}`);
        await prisma.document.delete({ where: { id: document.id } });
    },

    getAllDocuments: () => prisma.document.findMany()
};
