import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { noteRoutes, adminNoteRoutes } from './modules/notes/note.routes';
import { postRoutes } from './modules/posts/post.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';

const app: Application = express();

// ==========================================
// CORE SECURITY & PARSING MIDDLEWARES
// ==========================================
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================
app.get('/health', (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  });
});

// ==========================================
// API V1 ROUTE BINDINGS
// ==========================================
const apiV1Router = express.Router();

apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/users', userRoutes);
apiV1Router.use('/admin/users', userRoutes);
apiV1Router.use('/notes', noteRoutes);
apiV1Router.use('/admin/notes', adminNoteRoutes);
apiV1Router.use('/posts', postRoutes);
apiV1Router.use('/analytics', analyticsRoutes);

app.use('/api/v1', apiV1Router);

// ==========================================
// 404 & ERROR HANDLING MIDDLEWARES
// ==========================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
