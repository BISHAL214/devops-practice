import logger from '#config/logger.js';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { securityMiddleware } from '#middleware/security.middleware.js';

const app = express();

// middleware
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);
app.use(securityMiddleware);

// routes
app.get('/', (req, res) => {
  logger.info('Hello from devops practice api');
  res.status(200).send('Hello from devops practice api');
});
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    upTime: process.uptime(),
  });
});
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to DevOps Practice API',
    version: '1.0.0',
    //  documentation: '<URL>',
  });
});

// auth routes
app.use('/api/v1/auth', (await import('#routes/auth.routes.js')).default);
app.use('/api/v1/users', (await import('#routes/users.routes.js')).default);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
