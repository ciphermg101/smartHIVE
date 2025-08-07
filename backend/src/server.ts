import http from 'http';
import app from '@/app';
import { config } from '@config/configs';
import { socketCorsOptions } from '@config/cors-config';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocket, AuthenticatedSocket } from '@modules/chat/socket/socket.handler';

const PORT = config.port;
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

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { io };
export default server;