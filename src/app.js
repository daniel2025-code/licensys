import express from 'express';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import documentRoutes from './routes/document.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';

export const app = express();

app.use(express.static('public'));
app.use(express.json());

/* Rutas paras auth */
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api', documentRoutes);
