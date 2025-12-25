'use client';

import { BubbleMenu, Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Underline,
} from 'lucide-react';

interface FloatingToolbarProps {
  editor: Editor;
}

const ToolbarButton = ({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded transition-all duration-150 ${
      isActive
        ? 'bg-accent-1 text-white'
        : 'text-text-1 hover:bg-surface-2 hover:text-accent-1'
    }`}
    type="button"
    title={title}
  >
    {children}
  </button>
);

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top',
        maxWidth: 'none',
      }}
      className="bg-white dark:bg-surface-1 border border-border-1 rounded-lg shadow-lg px-1 py-1 flex items-center gap-0.5"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Cmd+B)"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Cmd+I)"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Cmd+U)"
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border-1 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>
    </BubbleMenu>
  );
}
