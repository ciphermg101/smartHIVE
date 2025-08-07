import React, { useEffect, useRef } from 'react';

const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose, position }) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute z-50 bg-background border rounded-lg shadow-lg p-2 flex gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="text-2xl hover:scale-125 transition-transform p-1"
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
