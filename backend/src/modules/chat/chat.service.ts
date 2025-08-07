import { Message, IMessage } from '@modules/chat/message.model';
import { AppException } from '@common/error-handler/errorHandler';
import { Types } from 'mongoose';

export class MessageService {

  static async createMessage(data: {
    apartmentId: string;
    senderId: string;
    content: string;
    type?: 'text' | 'image' | 'file' | 'system';
    replyTo?: string;
    metadata?: Record<string, any>;
  }): Promise<IMessage> {
    try {
      if (data.replyTo) {
        const originalMessage = await Message.findOne({
          _id: data.replyTo,
          apartmentId: new Types.ObjectId(data.apartmentId)
        });
        if (!originalMessage) {
          throw new AppException('Original message not found in this apartment', 404);
        }
      }

      const message = await Message.create({
        apartmentId: new Types.ObjectId(data.apartmentId),
        senderId: new Types.ObjectId(data.senderId),
        content: data.content,
        type: data.type || 'text',
        replyTo: data.replyTo ? new Types.ObjectId(data.replyTo) : undefined,
        metadata: data.metadata || {},
        reactions: [],
        readBy: [],
      });

      return message.toObject();
    } catch (error: any) {
      if (error instanceof AppException) throw error;
      throw new AppException(error, error.message || 'Failed to send message', error.status);
    }
  }

  static async getRecentMessages(apartmentId: string, userId: string, limit = 50, before?: Date): Promise<{ messages: IMessage[], hasMore: boolean }> {
    try {
      const query: any = { apartmentId: new Types.ObjectId(apartmentId) };
      if (before) query.createdAt = { $lt: before };

      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate('sender', 'userId role status name avatar')
        .populate('replyMessage')
        .lean();

      const hasMore = messages.length > limit;
      if (hasMore) {
        messages.pop();
      }

      return {
        messages: messages.reverse(),
        hasMore
      };
    } catch (error: any) {
      if (error instanceof AppException) throw error;
      throw new AppException(error, error.message || 'Failed to fetch messages', error.status);
    }
  }

  static async getMessageById(id: string, userId: string): Promise<IMessage> {
    try {
      const message = await Message.findById(id)
        .populate('sender', 'userId role status')
        .populate('replyMessage')
        .lean();

      if (!message) throw new AppException('Message not found', 404);

      return message;
    } catch (error: any) {
      if (error instanceof AppException) throw error;
      throw new AppException(error, error.message, error.status);
    }
  }

  static async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw new AppException('Message not found', 404);

      await Message.updateOne(
        { _id: messageId, 'readBy.userId': { $ne: new Types.ObjectId(userId) } },
        {
          $push: {
            readBy: {
              userId: new Types.ObjectId(userId),
              readAt: new Date(),
            },
          },
        }
      );
    } catch (error: any) {
      if (error instanceof AppException) throw error;
      throw new AppException(error, error.message || 'Failed to mark message as read', error.status);
    }
  }

  static async bulkMarkAsRead(apartmentId: string, userId: string): Promise<void> {
    try {
      await Message.updateMany(
        {
          apartmentId: new Types.ObjectId(apartmentId),
          'readBy.userId': { $ne: new Types.ObjectId(userId) },
        },
        {
          $push: {
            readBy: {
              userId: new Types.ObjectId(userId),
              readAt: new Date(),
            },
          },
        }
      );
    } catch (error: any) {
      if (error instanceof AppException) throw error;
      throw new AppException(error, error.message || 'Failed to mark messages as read', error.status);
    }
  }

  static async addReaction(messageId: string, userId: string, emoji: string): Promise<IMessage | null> {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw new AppException('Message not found', 404);

      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          $push: {
            reactions: {
              userId,
              emoji,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      ).lean();

      return updatedMessage;
    } catch (error: any) {
      if (error instanceof AppException) throw error;
      throw new AppException(error, error.message || 'Failed to react to message', error.status);
    }
  }

  static async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw new AppException('Message not found', 404);

      const result = await Message.findByIdAndDelete(messageId);
      return !!result;
    } catch (error: any) {
      if (error instanceof AppException) throw error;
      throw new AppException(error, error.message || 'Failed to delete message', error.status);
    }
  }

  static async listReactions(messageId: string, userId: string) {
    try {
      const message = await Message.findById(messageId, 'reactions apartmentId').lean();
      if (!message) throw new AppException('Message not found', 404);

      return message.reactions;
    } catch (error: any) {
      if (error instanceof AppException) throw error;
      throw new AppException(error, error.message || 'Failed to fetch reactions', error.status);
    }
  }

  static async getUnreadCount(apartmentId: string, userId: string): Promise<number> {
    try {
      const count = await Message.countDocuments({
        apartmentId: new Types.ObjectId(apartmentId),
        'readBy.userId': { $ne: new Types.ObjectId(userId) }
      });

      return count;
    } catch (error: any) {
      if (error instanceof AppException) throw error;
      throw new AppException(error, error.message || 'Failed to get unread count', error.status);
    }
  }
}