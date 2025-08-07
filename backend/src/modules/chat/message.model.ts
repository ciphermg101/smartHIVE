import { Schema, model, Document, Types } from 'mongoose';

export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface IMessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface IMessageRead {
  userId: Types.ObjectId;
  readAt: Date;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  apartmentId: Types.ObjectId;
  senderId: Types.ObjectId;
  sender?: {
    _id: Types.ObjectId;
    userId: string;
    role: string;
    status: string;
    name?: string;
    avatar?: string;
  };
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  readBy: IMessageRead[];
  replyTo?: Types.ObjectId;
  replyMessage?: IMessage;
  reactions: IMessageReaction[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    apartmentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Apartment',
      required: true,
      index: true 
    },
    senderId: { 
      type: Schema.Types.ObjectId, 
      ref: 'ApartmentProfile',
      required: true,
      index: true 
    },
    content: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 5000 
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    readBy: [{
      userId: { type: Schema.Types.ObjectId, ref: 'ApartmentProfile' },
      readAt: { type: Date, default: Date.now }
    }],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    reactions: [{
      userId: { type: String, required: true },
      emoji: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

messageSchema.index({ apartmentId: 1, createdAt: -1 });
messageSchema.index({ 'readBy.userId': 1 });

messageSchema.virtual('sender', {
  ref: 'ApartmentProfile',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});

messageSchema.virtual('replyMessage', {
  ref: 'Message',
  localField: 'replyTo',
  foreignField: '_id',
  justOne: true
});

export const Message = model<IMessage>('Message', messageSchema);