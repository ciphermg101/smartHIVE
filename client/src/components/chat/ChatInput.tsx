import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Paperclip, Smile, X, Send } from 'lucide-react';
import { cn } from '@lib/utils';
import { EmojiPicker } from './EmojiPicker';
import type { IMessage } from '@interfaces/chat';

interface ChatInputProps {
  onSendMessage: (content: string, replyTo?: string) => void;
  isSending: boolean;
  replyingTo?: IMessage | null;
  onCancelReply: () => void;
  onFileUpload?: (file: File) => Promise<string>;
  onTyping?: () => void;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isSending,
  replyingTo,
  onCancelReply,
  onFileUpload,
  onTyping,
  className,
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSendMessage(message.trim(), replyingTo?._id);
    setMessage('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileUpload) return;

    try {
      setIsUploading(true);
      const fileUrl = await onFileUpload(file);
      // Add the file URL to the message or handle it as needed
      setMessage(prev => `${prev} ${fileUrl}`.trim());
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Focus the input when replying to a message
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  return (
    <div className={cn('border-t bg-background p-4', className)}>
      {replyingTo && (
        <div className="relative mb-2 rounded-lg bg-muted/50 p-2 pr-8">
          <div className="text-xs font-medium text-muted-foreground">
            Replying to {replyingTo.sender?.name || 'user'}
          </div>
          <div className="truncate text-sm">
            {replyingTo.content.length > 50
              ? `${replyingTo.content.substring(0, 50)}...`
              : replyingTo.content}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6"
            onClick={onCancelReply}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !onFileUpload}
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
            />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
            <span className="sr-only">Add emoji</span>
          </Button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-10">
              <EmojiPicker
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
                position={{ x: 0, y: 0 }}
              />
            </div>
          )}
        </div>
        
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            className="pr-12"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping?.();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isSending || isUploading}
          />
        </div>
        
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isSending || isUploading}
          className="h-10 w-10"
        >
          {isSending || isUploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
};
