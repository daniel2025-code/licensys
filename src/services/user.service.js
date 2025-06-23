import { UserRepository } from '../repositories/user.repository.js';

export const UserService = {
    getAllUsers: () => UserRepository.getAll(),
    getUserById: (id) => UserRepository.getById(id),
    createUser: (data) => UserRepository.create(data),
    updateUser: async (id, data) => {
        if (data.password === '') delete data.password;
        await UserRepository.update(id, data);
    },
    deleteUser: (id) => UserRepository.delete(id),
    getDocuments: (id) => UserRepository.getDocuments(id)
};