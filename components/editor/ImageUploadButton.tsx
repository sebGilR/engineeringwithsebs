'use client';

import { Editor } from '@tiptap/react';
import { useRef, useState } from 'react';
import { Image as ImageIcon, ImagePlus } from 'lucide-react';

interface ImageUploadButtonProps {
  editor: Editor;
}

export function ImageUploadButton({ editor }: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      editor.chain().focus().setImage({ src: url }).run();
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowUrlInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowUrlInput(false);
      setImageUrl('');
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-md text-text-2 hover:bg-surface-2 hover:text-text-1 transition-all duration-150"
          type="button"
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className={`p-2 rounded-md transition-all duration-150 ${
            showUrlInput
              ? 'bg-accent-1 text-white'
              : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
          }`}
          type="button"
          title="Insert Image from URL"
        >
          <ImagePlus className="w-4 h-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {showUrlInput && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-surface-1 border border-border-1 rounded-lg shadow-lg p-2 z-50">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter image URL..."
              className="px-3 py-1.5 bg-surface-0 border border-border-1 rounded text-sm text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 min-w-[300px]"
              autoFocus
            />
            <button
              onClick={handleUrlSubmit}
              className="px-3 py-1.5 bg-accent-1 text-white text-sm rounded hover:bg-opacity-90 transition-colors"
              type="button"
            >
              Insert
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
