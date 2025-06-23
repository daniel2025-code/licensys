import { safeParse } from 'valibot';



export function validate(schema) {
    return (req, res, next) => {
        const result = safeParse(schema, req.body);
        if (!result.success) {
            const error = result.issues?.[0]?.message ?? 'Entrada inválida';
            return res.status(400).json({ error });
        }
        next();
    }
}