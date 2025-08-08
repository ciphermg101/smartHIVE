import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useUserStore } from '@store/user';
import { useApartmentStore } from '@store/apartment';
import { MessageCircle, Users, Hash } from 'lucide-react';
import { ScrollArea } from '@components/ui/scroll-area';
import { Button } from '@components/ui/button';
import { ChatHeader } from '@components/chat/ChatHeader';
import { ChatInput } from '@components/chat/ChatInput';
import { MessageBubble } from '@components/chat/MessageBubble';
import { useChatMessages, useSendMessage, useSocket, useMarkAllAsRead, useUnreadCount, useReactToMessage } from '@hooks/useChat';
import type { IMessage } from '@interfaces/chat';
import { toast } from 'sonner';
import { Socket } from 'socket.io-client';

export default function ChatSection() {
  const user = useUserStore((state) => state.user);
  const selectedProfile = useApartmentStore((state) => state.selectedProfile);
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const apartmentId = selectedProfile?.profile.apartmentId;
  const apartmentProfileId = selectedProfile?.profile._id;
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useChatMessages(apartmentId || '');
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(apartmentId || '', apartmentProfileId);
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { data: unreadCount } = useUnreadCount(apartmentId || '');
  const { mutate: reactToMessage } = useReactToMessage();
  const socket = useSocket(apartmentId || '', apartmentProfileId);

  const messages: IMessage[] = data?.messages || [];

  useEffect(() => {
    socketRef.current = socket.current;
    if (!socketRef.current?.connected) return;

    const handleUserTyping = (data: { senderId: string; senderName: string }) => {
      if (data.senderId !== apartmentProfileId) {
        setTypingUsers(prev => new Set(prev).add(data.senderId));
      }
    };

    const handleUserStoppedTyping = (data: { senderId: string }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.senderId);
        return newSet;
      });
    };

    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection error. Trying to reconnect...');
    };

    const currentSocket = socketRef.current;
    currentSocket.on('user-typing', handleUserTyping);
    currentSocket.on('user-stopped-typing', handleUserStoppedTyping);
    currentSocket.on('connect_error', handleConnectError);

    return () => {
      currentSocket.off('user-typing', handleUserTyping);
      currentSocket.off('user-stopped-typing', handleUserStoppedTyping);
      currentSocket.off('connect_error', handleConnectError);
    };
  }, [socket.current?.connected, apartmentProfileId]);

  // Handle typing events
  const handleTyping = () => {
    if (socket.current && socket.current.connected && apartmentId) {
      socket.current.emit('typing-start', { apartmentId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socket.current && socket.current.connected) {
          socket.current.emit('typing-stop', { apartmentId });
        }
      }, 1000);
    }
  };

  const handleSendMessage = (content: string, replyTo?: string) => {
    sendMessage({ content, replyTo });
    setReplyingTo(null);
  };

  const handleReply = (message: IMessage) => {
    setReplyingTo(message);
  };

  const handleReact = (messageId: string, emoji: string) => {
    reactToMessage({ messageId, emoji });
  };

  const handleMarkAsRead = () => {
    if (apartmentId) {
      markAllAsRead(apartmentId);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('auto');
    }
  }, [messages, scrollToBottom]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!apartmentId || !selectedProfile) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-background to-muted/20">
        <div className="text-center p-8 max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No apartment selected</h3>
          <p className="text-muted-foreground">
            Please select an apartment to start chatting with tenants and caretakers.
          </p>
        </div>
      </div>
    );
  }

  // Memoize participants to prevent unnecessary re-renders
  const participants = useMemo(() => [
    {
      id: user?.id || '',
      name: user?.fullName || user?.username || 'You',
      avatar: user?.imageUrl,
      role: 'tenant',
      isOnline: true
    }
  ], [user?.id, user?.fullName, user?.username, user?.imageUrl]);

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Enhanced Chat Header */}
      <ChatHeader
        apartmentName={selectedProfile.name || 'Apartment Chat'}
        unreadCount={unreadCount || 0}
        onMarkAsRead={handleMarkAsRead}
        participants={participants}
        className="border-b bg-background/50 backdrop-blur-sm"
      />

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isFetchingNextPage ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load previous messages'
                  )}
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 animate-pulse">
                    <div className="h-9 w-9 rounded-full bg-muted/50" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-muted/50" />
                      <div className="h-4 w-full rounded bg-muted/50" />
                      <div className="h-4 w-2/3 rounded bg-muted/50" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <p className="text-destructive font-medium">Error loading messages</p>
                  <p className="text-muted-foreground text-sm">Please try again later</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                  <Hash className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start the conversation</h3>
                <p className="text-muted-foreground mb-4">
                  No messages yet. Send a message to begin chatting with your neighbors.
                </p>
                <div className="flex items-center text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-full">
                  <Users className="h-3 w-3 mr-1" />
                  {participants.length} member{participants.length !== 1 ? 's' : ''}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg: IMessage) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isCurrentUser={msg.senderId === apartmentProfileId}
                    onReply={handleReply}
                    onReact={handleReact}
                    currentUserId={apartmentProfileId}
                  />
                ))}

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex items-center space-x-3 px-4 py-2 animate-pulse">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {typingUsers.size === 1 ? 'Someone is typing...' : `${typingUsers.size} people are typing...`}
                    </span>
                  </div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Enhanced Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isSending={isSending}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onTyping={handleTyping}
        className="border-t bg-background/50 backdrop-blur-sm"
      />
    </div>
  );
}