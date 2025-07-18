import app from '@/app';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { registerChatHandlers } from '@modules/chat';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Enable real-time chat with Clerk authentication
registerChatHandlers(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}); 