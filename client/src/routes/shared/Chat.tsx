import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSocket } from '@context/socket';
import { ChatMessage } from '@components/ui/ChatMessage';
import { useUser } from '@clerk/clerk-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  room: string;
}

interface ChatProps {
  room: string;
}

export default function Chat({ room }: ChatProps) {
  const { socket, joinRoom, sendMessage } = useSocket();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (room) joinRoom(room);
    if (!socket) return;
    setLoading(true);
    socket.emit('getMessages', room, (res: any) => {
      if (res.success) setMessages(res.data);
      setLoading(false);
    });
    socket.on('newMessage', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('newMessage');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const { register, handleSubmit, reset } = useForm<{ content: string }>();
  const onSubmit = ({ content }: { content: string }) => {
    if (!content.trim()) return;
    sendMessage(room, content);
    reset();
  };

  return (
    <div className="flex flex-col h-full max-h-[500px] border rounded-lg bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              sender={msg.senderId === user?.id ? 'You' : msg.senderId}
              content={msg.content}
              timestamp={msg.createdAt}
              isOwn={msg.senderId === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2 p-2 border-t">
        <input
          {...register('content')}
          className="flex-1 border rounded px-3 py-2 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          placeholder="Type a message..."
          aria-label="Type a message"
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded focus:ring-2 focus:ring-primary hover:bg-primary/80 transition" aria-label="Send message">Send</button>
      </form>
    </div>
  );
} 