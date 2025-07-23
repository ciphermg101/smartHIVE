import { Message, IMessage } from '@modules/chat/message.model';
import { AppException } from '@common/error-handler/errorHandler';

export class ChatService {
  static async sendMessage(data: {
    senderId: string;
    room: string;
    content: string;
    apartmentId?: string;
    unitId?: string
  }): Promise<IMessage> {
    try {
      if (!data.room || !data.content) {
        throw new AppException('Room and content are required', 400);
      }

      if (!data.senderId) {
        throw new AppException('Sender ID is required', 400);
      }

      const message = await Message.create({
        senderId: data.senderId,
        apartmentId: data.apartmentId ? data.apartmentId : undefined,
        unitId: data.unitId ? data.unitId : undefined,
        content: data.content,
        room: data.room,
      });

      return message.toObject();
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async getMessages(room: string): Promise<IMessage[]> {
    try {
      if (!room) {
        throw new AppException('Room is required', 400);
      }

      return await Message.find({ room })
        .sort({ createdAt: 1 })
        .lean();
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }
}