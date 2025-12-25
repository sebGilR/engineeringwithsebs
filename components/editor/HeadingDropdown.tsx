'use client';

import { Editor } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Heading1, Heading2, Heading3, Type } from 'lucide-react';

interface HeadingDropdownProps {
  editor: Editor;
}

export function HeadingDropdown({ editor }: HeadingDropdownProps) {
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

  const getCurrentLevel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return 'Paragraph';
  };

  const options = [
    {
      label: 'Paragraph',
      icon: Type,
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: editor.isActive('paragraph'),
    },
    {
      label: 'Heading 1',
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
    },
    {
      label: 'Heading 2',
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'Heading 3',
      icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-md text-sm font-medium text-text-2 hover:bg-surface-2 hover:text-text-1 transition-all duration-150 flex items-center gap-1"
        type="button"
      >
        <span>{getCurrentLevel()}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-surface-1 border border-border-1 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.label}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                  option.isActive
                    ? 'bg-accent-1 text-white'
                    : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
                }`}
                type="button"
              >
                <Icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
