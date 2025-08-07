
import React from 'react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const COMMON_EMOJIS = [
  '👍', '👎', '❤️', '😊', '😂', '😮', '😢', '😡',
  '🎉', '🔥', '✨', '💯', '👏', '🙏', '💪', '🤝'
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelect,
  onClose,
  position
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose}
      />
      
      {/* Emoji Picker */}
      <div 
        className={cn(
          "fixed z-50 bg-popover border rounded-lg shadow-lg p-3",
          "grid grid-cols-8 gap-1 w-64"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {COMMON_EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-lg hover:bg-accent"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </>
  );
};
