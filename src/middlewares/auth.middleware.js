import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { UserRepository } from "../repositories/user.repository.js";

export async function authMiddleware(req, res, next) {
    const token = req.header('x-authorization');
    if (!token) return res.status(401).json({ error: 'Falta token' });

    const user = await UserRepository.findUserByToken(token);
    if (!user) return res.status(401).json({ error: 'Token inválido' });

    req.user = user;
    next();
}

export const isAdminOrOwner = async (req, res, next) => {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id: Number(id) } });

    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    if (req.user.role !== 'admin' && doc.userId !== req.user.id)
        return res.status(403).json({ error: 'Acceso denegado' });

    req.document = doc;
    next();
};