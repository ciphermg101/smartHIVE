import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@store/user';
import { useApartmentStore } from '@store/apartment';
import { Send, Paperclip, Smile, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { ScrollArea } from '@components/ui/scroll-area';
import { format } from 'date-fns';
import { useChatMessages, useSendMessage } from '@hooks/useChat';
import type { IMessage } from '@interfaces/chat';

export default function ChatSection() {
  const user = useUserStore((state) => state.user);
  const selectedProfile = useApartmentStore((state) => state.selectedProfile);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apartmentId = selectedProfile?.profile.apartmentId;
  const { data, isLoading } = useChatMessages(apartmentId || '');
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(apartmentId || '');

  const messages: IMessage[] = data?.pages?.flatMap(page => page.messages) ?? [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    sendMessage({
      content: message,
    });

    setMessage('');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!apartmentId || !selectedProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <MessageCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No apartment selected</h3>
          <p className="text-sm text-muted-foreground">
            Please select an apartment to start chatting with tenants and caretakers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border overflow-hidden">
      {/* Chat Header */}
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedProfile.imageUrl} alt={selectedProfile.name} />
              <AvatarFallback>
                {selectedProfile.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
          </div>
          <div>
            <h3 className="font-medium">{selectedProfile.name || 'Apartment Chat'}</h3>
            <p className="text-xs text-muted-foreground">
              {messages.length > 0 ? `${messages.length} messages` : 'No messages yet'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
            <span className="sr-only">More options</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                Send a message to start the conversation.
              </p>
            </div>
          ) : (
            messages.map((msg: IMessage) => (
              <MessageBubble 
                key={msg._id} 
                message={msg} 
                isCurrentUser={msg.senderId === user?.id} 
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex items-center space-x-1">
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Send image</span>
            </Button>
          </div>
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Type a message..."
              className="pr-12"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-full w-10 text-muted-foreground"
            >
              <Smile className="h-4 w-4" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </div>
          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim() || isSending}
            className="h-10 w-10"
          >
            {isSending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: IMessage;
  isCurrentUser: boolean;
}

function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs lg:max-w-md xl:max-w-lg 2xl:max-w-xl ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.avatar} />
            <AvatarFallback>{message.sender?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </div>
        <div className={`mx-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
          <div 
            className={`inline-block rounded-2xl px-4 py-2 ${
              isCurrentUser 
                ? 'bg-primary text-primary-foreground rounded-br-none' 
                : 'bg-muted rounded-bl-none'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(message.createdAt), 'h:mm a')}
          </p>
        </div>
      </div>
    </div>
  );
}