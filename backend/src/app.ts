import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import { clerkMiddleware } from '@common/middleware/clerkAuth';
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

// CORS configuration
const allowedOrigins: string[] = [];

if (config.allowedOrigins) {
  allowedOrigins.push(
    ...config.allowedOrigins.split(',').map((origin) => origin.trim())
  );
}

const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin || config.env === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      return callback(new Error(`Not allowed by CORS: ${origin}`), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Date',
    'X-Api-Version'
  ],
  exposedHeaders: [
    'Authorization',
    'X-Country',
    'Clerk-Cookie',
    'Clerk-Db-Jwt'
  ]
};

app.use(cors(corsOptions));

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
app.use('/api/v1/apartments', apartmentRouter);
app.use('/api/v1/units', unitRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/issues', issueRouter);
app.use('/api/v1/users', userRouter);

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app; 