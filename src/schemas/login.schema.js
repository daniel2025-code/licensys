import { object, string, minLength } from 'valibot';



export const loginSchema = object({
    username: string([minLength(1, 'Username requerido')]),
    password: string([minLength(1, 'Password requerido')])
});