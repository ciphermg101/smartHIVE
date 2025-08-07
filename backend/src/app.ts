import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import { clerkMiddleware } from '@common/middleware/clerkAuth';
import { errorHandler } from '@common/error-handler/errorHandler';
import { responseInterceptor } from '@common/interceptors/responseInterceptor';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@docs/swagger';
import { apartmentRouter } from '@modules/apartments';
import { unitRouter } from '@modules/units';
import { paymentRouter } from '@modules/rent';
import { issueRouter } from '@modules/issues';
import { userRouter } from '@modules/users';
import webhookRouter from '@common/webhooks/webhook.controller';
import { requireApiVersion } from '@common/middleware/requireApiVersion';
import cloudinaryRouter from '@common/cloudinary/cloudinary.controller';
import { chatRouter } from '@modules/chat';
import { corsConfig } from '@config/cors-config';

const app = express();

app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS
app.use(cors(corsConfig));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Body parsing
app.use(json());
app.use(urlencoded({ extended: true }));

// Auth + interceptors
app.use(clerkMiddleware);
app.use(responseInterceptor);
app.use(requireApiVersion);

// Routes
app.use('/api/v1/webhooks', webhookRouter);
app.use('/api/v1/cloudinary', cloudinaryRouter);
app.use('/api/v1/apartments', apartmentRouter);
app.use('/api/v1/units', unitRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/issues', issueRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler
app.use(errorHandler);

export default app;