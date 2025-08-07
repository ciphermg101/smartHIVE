export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface IMessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface IMessage {
  _id: string;
  apartmentId: string;
  senderId: string;
  sender?: {
    _id: string;
    userId: string;
    role: string;
    status: string;
    name?: string;
    avatar?: string;
  };
  content: string;
  type: MessageType;
  status: MessageStatus;
  readBy: Array<{
    userId: string;
    readAt: Date | string;
  }>;
  replyTo?: string;
  replyMessage?: IMessage;
  reactions: IMessageReaction[];
  metadata?: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SendMessageParams {
  content: string;
  apartmentId: string;
  type?: MessageType;
  replyTo?: string;
  metadata?: Record<string, any>;
}

export interface ChatMessageProps {
  message: IMessage;
  isCurrentUser: boolean;
  onReply?: (message: IMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export interface ChatInputProps {
  onSendMessage: (message: string, replyTo?: string) => void;
  isSending: boolean;
  replyingTo?: IMessage | null;
  onCancelReply?: () => void;
  onFileUpload?: (file: File) => Promise<string>;
}

export interface ChatHeaderProps {
  apartmentName: string;
  unreadCount: number;
  onMarkAsRead: () => void;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
    isOnline: boolean;
  }>;
}

export interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export interface MessageReactionProps {
  reactions: IMessageReaction[];
  onReaction: (emoji: string) => void;
  currentUserId?: string;
}
