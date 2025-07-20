import { Message, IMessage } from '@modules/chat/message.model';
import { Types } from 'mongoose';

export class ChatService {
  static async sendMessage(data: { senderId: string; room: string; content: string; apartmentId?: string; unitId?: string }): Promise<IMessage> {
    if (!data.room || !data.content) throw Object.assign(new Error('Room and content are required'), { status: 400 });
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
    if (!room) throw Object.assign(new Error('Room is required'), { status: 400 });
    return Message.find({ room }).sort({ createdAt: 1 }).lean();
  }
} 