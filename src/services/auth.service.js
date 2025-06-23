import crypto from 'node:crypto';
import { UserRepository } from '../repositories/user.repository.js';

export const AuthService = {
    authenticateUser: async (username, password) => {
        const user = await UserRepository.loginUser(username, password);

        if (!user) return null;

        const token = crypto.randomBytes(48).toString('hex');
        await UserRepository.update(user.id, { token });

        return {
            username: user.username,
            name: user.name,
            role: user.role,
            token
        };
    },

    logoutUser: (token) => UserRepository.logoutUserByToken(token)
}

