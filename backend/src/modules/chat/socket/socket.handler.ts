import { Server, Socket } from 'socket.io';
import { MessageService } from '@modules/chat/chat.service';

export interface AuthenticatedSocket extends Socket {
  senderId?: string;
  apartmentIds?: string[];
}

export interface JoinRoomPayload {
  apartmentId: string;
}

export interface SendMessagePayload {
  apartmentId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'system';
  replyTo?: string;
  metadata?: Record<string, any>;
}

export interface ReactToMessagePayload {
  messageId: string;
  emoji: string;
}

export function initializeSocket(io: Server, socket: AuthenticatedSocket): void {
  // Authentication is already handled by clerkAuthSocket middleware
  // The senderId should be set by the middleware
  if (!socket.senderId) {
    console.log('No senderId found on socket - authentication may have failed');
    socket.emit('error', { message: 'Authentication required' });
    socket.disconnect();
    return;
  }
  
  console.log('Socket connected for user:', socket.senderId);

  socket.on('join-apartment', async (payload: JoinRoomPayload) => {
    try {
      const { apartmentId } = payload;

      const roomName = `apartment:${apartmentId}`;
      await socket.join(roomName);
      
      if (!socket.apartmentIds) socket.apartmentIds = [];
      if (!socket.apartmentIds.includes(apartmentId)) {
        socket.apartmentIds.push(apartmentId);
      }

      socket.emit('joined-apartment', { apartmentId });
      
      socket.to(roomName).emit('user-joined', {
        senderId: socket.senderId,
        apartmentId
      });

    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to join apartment' });
    }
  });

  socket.on('leave-apartment', (payload: JoinRoomPayload) => {
    const { apartmentId } = payload;
    const roomName = `apartment:${apartmentId}`;
    
    socket.leave(roomName);
    
    if (socket.apartmentIds) {
      socket.apartmentIds = socket.apartmentIds.filter(id => id !== apartmentId);
    }
    
    socket.emit('left-apartment', { apartmentId });
    socket.to(roomName).emit('user-left', {
      senderId: socket.senderId,
      apartmentId
    });
  });

  socket.on('send-message', async (payload: SendMessagePayload) => {
    try {
      const message = await MessageService.createMessage({
        ...payload,
        senderId: socket.senderId || ''
      });

      // Populate the message before sending
      const populatedMessage = await MessageService.getMessageById(message._id.toString(), socket.senderId || '');
      
      const roomName = `apartment:${payload.apartmentId}`;
      
      io.to(roomName).emit('new-message', populatedMessage);
      
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to send message' });
    }
  });

  socket.on('mark-message-read', async (payload: { messageId: string }) => {
    try {
      await MessageService.markMessageAsRead(payload.messageId, socket.senderId || '');
      
      const message = await MessageService.getMessageById(payload.messageId, socket.senderId || '');
      const roomName = `apartment:${message.apartmentId}`;
      
      socket.to(roomName).emit('message-read', {
        messageId: payload.messageId,
        senderId: socket.senderId,
        readAt: new Date()
      });

    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to mark message as read' });
    }
  });

  socket.on('react-to-message', async (payload: ReactToMessagePayload) => {
    try {
      const updatedMessage = await MessageService.addReaction(
        payload.messageId, 
        socket.senderId || '', 
        payload.emoji
      );
      
      if (updatedMessage) {
        const roomName = `apartment:${updatedMessage.apartmentId}`;
        
        io.to(roomName).emit('message-reaction', {
          messageId: payload.messageId,
          reaction: {
            senderId: socket.senderId,
            emoji: payload.emoji,
            createdAt: new Date()
          }
        });
      }

    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to add reaction' });
    }
  });

  socket.on('typing-start', (payload: { apartmentId: string }) => {
    const roomName = `apartment:${payload.apartmentId}`;
    socket.to(roomName).emit('user-typing', {
      senderId: socket.senderId,
      apartmentId: payload.apartmentId
    });
  });

  socket.on('typing-stop', (payload: { apartmentId: string }) => {
    const roomName = `apartment:${payload.apartmentId}`;
    socket.to(roomName).emit('user-stopped-typing', {
      senderId: socket.senderId,
      apartmentId: payload.apartmentId
    });
  });

  socket.on('disconnect', () => {
    if (socket.apartmentIds) {
      socket.apartmentIds.forEach(apartmentId => {
        const roomName = `apartment:${apartmentId}`;
        socket.to(roomName).emit('user-disconnected', {
          senderId: socket.senderId,
          apartmentId
        });
      });
    }
  });
}