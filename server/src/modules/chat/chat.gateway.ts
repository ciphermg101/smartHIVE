import { Server, Socket as IOSocket } from 'socket.io';
import { verifyClerkToken } from '@modules/chat/clerkSocketAuth';
import { ChatService } from '@modules/chat/chat.service';

interface JoinRoomPayload {
  room: string;
}

interface SendMessagePayload {
  room: string;
  content: string;
  apartmentId?: string;
  unitId?: string;
}

interface ClerkUser {
  id: string;
  session?: unknown;
}

interface SocketWithUser extends IOSocket {
  user?: ClerkUser;
}

export function registerChatHandlers(io: Server) {
  io.use(async (socket: IOSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization'];
    try {
      const { userId, session } = await verifyClerkToken(token);
      (socket as SocketWithUser).user = { id: userId, session };
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: IOSocket) => {
    const user = (socket as SocketWithUser).user!;
    // Join personal room
    socket.join(`user:${user.id}`);

    socket.on('joinRoom', (payload: JoinRoomPayload) => {
      socket.join(payload.room);
    });

    socket.on('sendMessage', async (payload: SendMessagePayload) => {
      try {
        const message = await ChatService.sendMessage({
          senderId: user.id,
          apartmentId: payload.apartmentId,
          unitId: payload.unitId,
          content: payload.content,
          room: payload.room,
        });
        io.to(payload.room).emit('newMessage', {
          id: message._id,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt,
          room: message.room,
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
        socket.emit('error', { success: false, message: errorMsg });
      }
    });

    // Optionally: fetch message history
    socket.on('getMessages', async (room: string, cb) => {
      try {
        const messages = await ChatService.getMessages(room);
        cb({ success: true, data: messages });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch messages';
        cb({ success: false, message: errorMsg });
      }
    });
  });
} 