import { Message, IMessage } from '@modules/chat/message.model';
import { Types } from 'mongoose';
import { ValidationError } from '@common/error-handler/CustomErrors';

export class ChatService {
  static async sendMessage(data: { senderId: string; room: string; content: string; apartmentId?: string; unitId?: string }): Promise<IMessage> {
    if (!data.room || !data.content) throw new ValidationError('Room and content are required');
    const message = await Message.create({
      senderId: new Types.ObjectId(data.senderId),
      apartmentId: data.apartmentId ? new Types.ObjectId(data.apartmentId) : undefined,
      unitId: data.unitId ? new Types.ObjectId(data.unitId) : undefined,
      content: data.content,
      room: data.room,
    });
    return message.toObject();
  }

  static async getMessages(room: string): Promise<IMessage[]> {
    if (!room) throw new ValidationError('Room is required');
    return Message.find({ room }).sort({ createdAt: 1 }).lean();
  }
} 