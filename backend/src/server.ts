import http from 'http';
import app from './app';
import { config } from '@config/configs';
import { socketCorsOptions } from '@config/cors-config';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocket, AuthenticatedSocket } from '@modules/chat/socket/socket.handler';
import { connectDB } from '@config/db';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: socketCorsOptions,
  path: '/socket.io/',
  serveClient: false,
  transports: ['websocket', 'polling']
});

io.on('connection', (socket: AuthenticatedSocket) => {
  initializeSocket(io, socket);
  socket.on('disconnect', () => { });
});

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

export { io };
export default server;