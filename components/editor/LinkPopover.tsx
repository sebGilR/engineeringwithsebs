'use client';

import { BubbleMenu, Editor } from '@tiptap/react';
import { useState, useEffect, useRef } from 'react';
import { Link2, ExternalLink, Trash2, Check, X } from 'lucide-react';

interface LinkPopoverProps {
  editor: Editor;
}

export function LinkPopover({ editor }: LinkPopoverProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const shouldShow = ({ editor }: { editor: Editor }) => {
    return editor.isActive('link');
  };

  const handleSetLink = () => {
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    }
    setIsEditing(false);
    setUrl('');
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setIsEditing(false);
    setUrl('');
  };

  const handleEdit = () => {
    const currentUrl = editor.getAttributes('link').href;
    setUrl(currentUrl || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
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

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        duration: 100,
        placement: 'bottom',
        maxWidth: 'none',
      }}
      className="bg-white dark:bg-surface-1 border border-border-1 rounded-lg shadow-lg overflow-hidden"
    >
      {isEditing ? (
        <div className="flex items-center gap-1 p-2">
          <input
            ref={inputRef}
            type="url"
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
      ) : (
        <div className="flex items-center gap-1 p-1">
          <a
            href={editor.getAttributes('link').href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm text-accent-1 hover:underline flex items-center gap-1 max-w-[200px] truncate"
          >
            <span className="truncate">{editor.getAttributes('link').href}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
          <div className="w-px h-6 bg-border-1" />
          <button
            onClick={handleEdit}
            className="p-1.5 text-text-2 hover:bg-surface-2 rounded transition-colors"
            type="button"
            title="Edit Link"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRemoveLink}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            type="button"
            title="Remove Link"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </BubbleMenu>
  );
}
