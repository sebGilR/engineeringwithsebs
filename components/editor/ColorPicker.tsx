'use client';

import { Editor } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  editor: Editor;
}

const COLORS = [
  { name: 'Default', value: null },
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
];

export function ColorPicker({ editor }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentColor = () => {
    const color = editor.getAttributes('textStyle').color;
    return color || null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-text-2 hover:bg-surface-2 hover:text-text-1 transition-all duration-150"
        type="button"
        title="Text Color"
      >
        <div className="relative">
          <Palette className="w-4 h-4" />
          {getCurrentColor() && (
            <div
              className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded"
              style={{ backgroundColor: getCurrentColor() }}
            />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-surface-1 border border-border-1 rounded-lg shadow-lg p-2 z-50">
          <div className="grid grid-cols-5 gap-1">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => {
                  if (color.value) {
                    editor.chain().focus().setColor(color.value).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                  setIsOpen(false);
                }}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  getCurrentColor() === color.value
                    ? 'border-accent-1 scale-110'
                    : 'border-border-1 hover:border-text-3'
                }`}
                style={{ backgroundColor: color.value || '#ffffff' }}
                title={color.name}
                type="button"
              >
                {!color.value && (
                  <div className="w-full h-full flex items-center justify-center text-xs text-text-3">
                    A
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
