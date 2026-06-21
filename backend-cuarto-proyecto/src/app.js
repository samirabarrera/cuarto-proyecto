import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { requireAuth } from './middlewares/auth.js';

// Rutas
import categoryRoutes from './routes/category.js';
import transactionRoutes from './routes/transactions.js';
import summaryRoutes  from './routes/summary.js';
import tipsRoutes     from './routes/tips.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// ── Rutas públicas (no requieren login) ──────────────────
app.use('/api/tips', tipsRoutes);

// ── Rutas protegidas (requieren JWT válido de Auth0) ─────
app.use('/api/category',     requireAuth, categoryRoutes);
app.use('/api/transactions', requireAuth, transactionRoutes);
app.use('/api/summary',      requireAuth, summaryRoutes);

export default app;