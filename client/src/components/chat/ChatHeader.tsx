import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { MoreVertical, Users, Bell, BellOff, CheckCircle } from 'lucide-react';
import { cn } from '@lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
}

interface ChatHeaderProps {
  apartmentName: string;
  unreadCount: number;
  onMarkAsRead: () => void;
  participants: Participant[];
  isMuted?: boolean;
  onMuteToggle?: () => void;
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  apartmentName,
  unreadCount,
  onMarkAsRead,
  participants,
  isMuted = false,
  onMuteToggle,
  className,
}) => {
  const onlineCount = participants.filter(p => p.isOnline).length;
  const participantNames = participants.map(p => p.name).join(', ');

  return (
    <div className={cn('border-b p-4 flex items-center justify-between bg-background', className)}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={participants[0]?.avatar} alt={apartmentName} />
            <AvatarFallback>{apartmentName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          {onlineCount > 0 && (
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
          )}
        </div>
        
        <div>
          <h3 className="font-medium">{apartmentName}</h3>
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            <span>{participants.length} member{participants.length !== 1 ? 's' : ''}</span>
            {onlineCount > 0 && (
              <span className="ml-2 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                {onlineCount} online
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={onMarkAsRead}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Mark as read
          </Button>
        )}
        
        {onMuteToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={onMuteToggle}
          >
            {isMuted ? (
              <BellOff className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'} notifications</span>
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              View group info
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(participantNames)}>
              Copy member list
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Leave group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
