import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const key = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${key}`;
};

async function main() {
    const users = [
        {
            username: 'admin',
            name: 'Daniel Aravena',
            password: 'licensys123',
            role: 'admin',
            rut: '17506825-2',
        },
        {
            username: 'user1',
            name: 'María González',
            password: 'usuario123',
            role: 'user',
            rut: '12345678-9',
        },
        {
            username: 'user2',
            name: 'Juan Pérez',
            password: 'test1234',
            role: 'user',
            rut: '98765432-1',
        },
    ];

    await Promise.all(
        users.map(user =>
            prisma.user.upsert({
                where: { username: user.username },
                update: {},
                create: {
                    ...user,
                    password: hashPassword(user.password),
                },
            })
        )
    );
}

main().finally(() => prisma.$disconnect());
