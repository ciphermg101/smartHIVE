import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import { clerkMiddleware, requireAuth } from '@common/middleware/clerkAuth';
import { errorHandler } from '@common/error-handler/errorHandler';
import { responseInterceptor } from '@common/interceptors/responseInterceptor';
import { connectDB } from '@config/db';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@docs/swagger';
import { apartmentRouter } from '@modules/apartments';
import { unitRouter } from '@modules/units';
import { paymentRouter } from '@modules/rent';
import { issueRouter } from '@modules/issues';
import { userRouter } from '@modules/users';
import webhookRouter from '@common/webhooks/webhook.controller';
import { requireApiVersion } from '@common/middleware/requireApiVersion';
import { config } from '@config/configs';

const app = express();

app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

app.use(cors({
  origin: config.clientOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Database connection
connectDB();

// Body parsing middleware
app.use(json());
app.use(urlencoded({ extended: true }));

// Clerk authentication middleware
app.use(clerkMiddleware);

// Response interceptor
app.use(responseInterceptor);

// API versioning middleware
app.use(requireApiVersion);

// Webhook routes
app.use('/api/v1/webhooks', webhookRouter);

// API routes
const protectedRoutes = express.Router();
protectedRoutes.use(requireAuth);

protectedRoutes.use('/apartments', apartmentRouter);
protectedRoutes.use('/units', unitRouter);
protectedRoutes.use('/payments', paymentRouter);
protectedRoutes.use('/issues', issueRouter);
protectedRoutes.use('/users', userRouter);

app.use('/api/v1', protectedRoutes);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app; 