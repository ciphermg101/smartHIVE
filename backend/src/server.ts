import http from 'http';
import app from '@/app';
import { socketCorsOptions } from '@config/cors-config';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocket, AuthenticatedSocket } from '@modules/chat/socket/socket.handler';
import { connectDB } from '@config/db';
import { clerkAuthSocket } from '@common/middleware/clerkAuth';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(server, {
  cors: socketCorsOptions,
  path: '/socket.io/',
  serveClient: false,
  transports: ['websocket', 'polling']
});

io.use(clerkAuthSocket);

io.on('connection', (socket: AuthenticatedSocket) => {
  initializeSocket(io, socket);

  socket.on('disconnect', () => { });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

export { io };
export default server;