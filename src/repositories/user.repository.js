import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import crypto from 'node:crypto';


const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const key = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${key}`;
}


export const UserRepository = {
    getAll: () => prisma.user.findMany(),

    getById: (id) => prisma.user.findUnique({ where: { id } }),

    create: async (data) => {
        data.password = hashPassword(data.password);
        await prisma.user.create({ data });
    },

    update: async (id, data) => {
        if ('password' in data)
            data.password = hashPassword(data.password);

        await prisma.user.update({ where: { id }, data });
    },

    delete: (id) => prisma.user.delete({ where: { id } }),

    loginUser: (username, password) => {
        return prisma.user.findUnique({ where: {username}}).then(user => {
            if (!user) return null;

            const [salt, key] = user.password.split(':');
            const hashedBuffer = crypto.scryptSync(password, salt, 64);
            const keyBuffer = Buffer.from(key, 'hex');

            const isMatch = crypto.timingSafeEqual(hashedBuffer, keyBuffer);
            return isMatch ? user : null;
        });
    },

    findUserByToken: (token) => prisma.user.findFirst({ where: { token } }),

    logoutUserByToken: (token) => prisma.user.updateMany({
        where: { token },
        data: { token: null }
    }),

    getDocuments: async (userId) => {
        return prisma.document.findMany({
            where: { userId },
            orderBy: { created_at: 'desc' }
        });
    }
};

