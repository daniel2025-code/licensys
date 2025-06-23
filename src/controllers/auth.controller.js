import { AuthService } from "../services/auth.service.js";

export const AuthController = {
    login: async (req, res) => {
        const { username, password } = req.body;
        const result = await AuthService.authenticateUser(username, password);

        if (!result) return res.status(401).json({ error: 'Credenciales inválidas' });
        res.json(result);
    },
    logout: async (req, res) => {
        const token = req.header('X-Authorization');
        await AuthService.logoutUser(token);
        res.sendStatus(204);
    }
}

