import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { cn } from '@lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip';
import { Reply, SmilePlus } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import type { IMessage } from '@interfaces/chat';

interface MessageBubbleProps {
  message: IMessage;
  isCurrentUser: boolean;
  onReply: (message: IMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
  currentUserId?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  onReply,
  onReact,
  currentUserId
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState({ x: 0, y: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = () => {
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect) {
      setEmojiPosition({
        x: isCurrentUser ? rect.left - 200 : rect.right,
        y: rect.top - 50,
      });
      setShowEmojiPicker(true);
    }
  };

  const handleReaction = (emoji: string) => {
    onReact(message._id, emoji);
  };

  const hasReactions = message.reactions && message.reactions.length > 0;
  const uniqueReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 1,
        userReacted: reaction.userId === currentUserId,
      };
    } else {
      acc[reaction.emoji].count++;
      if (reaction.userId === currentUserId) {
        acc[reaction.emoji].userReacted = true;
      }
    }
    return acc;
  }, {} as Record<string, { emoji: string; count: number; userReacted: boolean }>);

  return (
    <div 
      ref={bubbleRef}
      className={cn(
        'flex group',
        isCurrentUser ? 'justify-end' : 'justify-start',
        'mb-4 last:mb-0'
      )}
    >
      <div className={cn(
        'flex max-w-[80%]',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row',
      )}>
        {!isCurrentUser && (
          <div className="flex-shrink-0 mr-2 self-end mb-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.sender?.avatar} alt={message.sender?.name} />
              <AvatarFallback>{(message.sender?.name?.[0] || 'U').toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        )}
        
        <div className={cn(
          'flex flex-col',
          isCurrentUser ? 'items-end' : 'items-start'
        )}>
          {message.replyTo && message.replyMessage && (
            <div className={cn(
              'text-xs text-muted-foreground mb-1 px-2 py-1 bg-muted/50 rounded max-w-full truncate',
              isCurrentUser ? 'mr-2' : 'ml-2'
            )}>
              Replying to {message.replyMessage.sender?.name || 'user'}: {message.replyMessage.content}
            </div>
          )}
          
          <div className="relative group">
            <div className={cn(
              'rounded-2xl px-4 py-2 text-sm',
              isCurrentUser 
                ? 'bg-primary text-primary-foreground rounded-br-none' 
                : 'bg-muted rounded-bl-none',
              'relative group'
            )}>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              
              <div className={cn(
                'flex items-center mt-1 text-xs',
                isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground',
                'justify-end space-x-1'
              )}>
                <span>{
                  message.createdAt ? 
                    format(new Date(message.createdAt), 'h:mm a') : 
                    'Just now'
                }</span>
                {isCurrentUser && (
                  <span className={cn(
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'inline-flex items-center ml-1'
                  )}>
                    ✓✓
                  </span>
                )}
              </div>
            </div>

            <div className={cn(
              'absolute -top-2 -right-8 opacity-0 group-hover:opacity-100 transition-opacity',
              'flex items-center space-x-1 bg-background rounded-full p-1 shadow-md',
              isCurrentUser ? 'flex-row' : 'flex-row-reverse'
            )}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => onReply(message)}
                  >
                    <Reply className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Reply</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={handleEmojiClick}
                  >
                    <SmilePlus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Add reaction</TooltipContent>
              </Tooltip>

              {showEmojiPicker && (
                <div className="absolute -top-12 right-0">
                  <EmojiPicker
                    onSelect={handleReaction}
                    onClose={() => setShowEmojiPicker(false)}
                    position={emojiPosition}
                  />
                </div>
              )}
            </div>
          </div>

          {hasReactions && (
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.entries(uniqueReactions || {}).map(([emoji, { count, userReacted }]) => (
                <Button
                  key={emoji}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-6 px-2 text-xs rounded-full',
                    userReacted ? 'bg-primary/10 border-primary' : 'bg-background',
                    'flex items-center space-x-1'
                  )}
                  onClick={() => handleReaction(emoji)}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
