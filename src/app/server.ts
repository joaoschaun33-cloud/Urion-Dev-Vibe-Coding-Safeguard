// src/app/server.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/error-handler';
import { logger } from '@/shared/infrastructure/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Middlewares globais
app.use(helmet());

const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigin = process.env.CORS_ORIGIN;

if (isProduction && !allowedOrigin) {
  logger.error(
    'CRITICAL: CORS_ORIGIN nao definido em ambiente de producao! Servidor recusando inicializacao.'
  );
  process.exit(1);
}

app.use(
  cors({
    origin: allowedOrigin ?? (isProduction ? false : 'http://localhost:5173'),
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10kb' }));

// Rotas
app.use('/api/v1', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    type: 'https://api.example.com/errors/not-found',
    title: 'Not Found',
    status: 404,
    detail: 'Endpoint nao encontrado',
  });
});

// Error handler (DEVE ser o ultimo middleware)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({
    event: 'SERVER_STARTED',
    port: PORT,
    env: process.env.NODE_ENV,
    url: `http://localhost:${String(PORT)}`,
  });
});

export default app;
