import {
    object,
    string,
    minLength,
    optional,
    enum_ as vEnum,
} from 'valibot';

export const createUserSchema = object({
    username: string([minLength(3, 'El nombre de usuario debe tener al menos 3 caracteres')]),
    name: string([minLength(1, 'El nombre es obligatorio')]),
    password: string([minLength(6, 'La contraseña debe tener al menos 6 caracteres')]),
    role: optional(vEnum(['admin', 'user'])),
    rut: string([minLength(1, 'El rut es obligatorio')])
});

export const updateUserSchema = object({
    username: optional(string([minLength(3)])),
    name: optional(string([minLength(1)])),
    password: optional(string([minLength(6)])),
    role: optional(vEnum(['admin', 'user'])),
    rut: optional(string([minLength(1)]))
});
