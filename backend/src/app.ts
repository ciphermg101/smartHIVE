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
import cloudinaryRouter from '@common/cloudinary/cloudinary.controller';
import { chatRouter } from '@modules/chat';
import { corsConfig } from '@config/cors-config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeSocket } from '@modules/chat/socket/socket.handler';
import { clerkAuthSocket } from '@common/middleware/clerkAuth';

const app = express();

const server = createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io'
});

// Socket authentication and initialization
io.use(clerkAuthSocket);
io.on('connection', (socket) => {
  initializeSocket(io, socket);
});

// Make io available globally
app.set('io', io);


app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

app.use(cors(corsConfig));

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

// Cloudinary routes
app.use('/api/v1/cloudinary',cloudinaryRouter);

// API routes
app.use('/api/v1/apartments', apartmentRouter);
app.use('/api/v1/units', unitRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/issues', issueRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chat', chatRouter);

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;