'use client';

import { Editor } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { Link2, Check, X } from 'lucide-react';

interface LinkButtonProps {
  editor: Editor;
}

export function LinkButton({ editor }: LinkButtonProps) {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showInput &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowInput(false);
        setUrl('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInput]);

  const handleSetLink = () => {
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      // Add https:// if no protocol is specified
      const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: finalUrl })
        .run();
    }
    setShowInput(false);
    setUrl('');
  };

  const handleCancel = () => {
    setShowInput(false);
    setUrl('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSetLink();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleButtonClick = () => {
    if (editor.isActive('link')) {
      // If already a link, get the current URL
      const currentUrl = editor.getAttributes('link').href;
      setUrl(currentUrl || '');
    }
    setShowInput(true);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className={`p-2 rounded-md transition-all duration-150 ${
          editor.isActive('link') || showInput
            ? 'bg-accent-1 text-white shadow-sm'
            : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
        }`}
        type="button"
        title="Add/Edit Link"
      >
        <Link2 className="w-4 h-4" />
      </button>

      {showInput && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-surface-1 border border-border-1 rounded-lg shadow-lg p-2 z-50 flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL..."
            className="px-3 py-1.5 bg-surface-0 border border-border-1 rounded text-sm text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 min-w-[300px]"
          />
          <button
            onClick={handleSetLink}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
            type="button"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 text-text-3 hover:bg-surface-2 rounded transition-colors"
            type="button"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
