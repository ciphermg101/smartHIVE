import '@common/sentry/sentry';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import { clerkMiddleware } from '@clerk/express'
import { errorHandler } from '@common/error-handler/errorHandler';
import { responseInterceptor } from '@common/interceptors/responseInterceptor';
import { connectDB } from '@config/db';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@docs/swagger';
import { apartmentRouter } from '@modules/apartments';
import { unitRouter } from '@modules/units';
import { tenantRouter } from '@modules/tenants';
import { paymentRouter } from '@modules/rent';
import { issueRouter } from '@modules/issues';
import { userRouter } from '@modules/users';

dotenv.config();

const app = express();
app.use(clerkMiddleware())

// Security
app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Body parsing
app.use(json());
app.use(urlencoded({ extended: true }));

// Response interceptor
app.use(responseInterceptor);

// Connect to DB
connectDB();

// Register modules/routes here
app.use('/api/v1/apartments', apartmentRouter);
app.use('/api/v1/units', unitRouter);
app.use('/api/v1/tenants', tenantRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/issues', issueRouter);
app.use('/api/v1/users', userRouter);

// Swagger docs
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(errorHandler);

export default app; 