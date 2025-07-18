interface ChatMessageProps {
  sender: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
}

export function ChatMessage({ sender, content, timestamp, isOwn }: ChatMessageProps) {
  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-xs px-4 py-2 rounded-lg shadow mb-1 ${isOwn ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
        <div className="text-xs font-semibold mb-1">{sender}</div>
        <div>{content}</div>
      </div>
      <div className="text-xs text-gray-400 mb-2">{new Date(timestamp).toLocaleTimeString()}</div>
    </div>
  );
} 