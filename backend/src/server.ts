import http from 'http';
import app from '@/app';
import { Server as SocketIOServer } from 'socket.io';
import { registerChatHandlers } from '@modules/chat';
import { config } from '@config/configs';

const PORT = config.port;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.clientOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Enable real-time chat with Clerk authentication
registerChatHandlers(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}); 