'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Undo,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { FloatingToolbar } from './FloatingToolbar';
import { HeadingDropdown } from './HeadingDropdown';
import { TextAlignButtons } from './TextAlignButtons';
import { ColorPicker } from './ColorPicker';
import { LinkPopover } from './LinkPopover';
import { LinkButton } from './LinkButton';
import { ImageUploadButton } from './ImageUploadButton';
import './editor.css';

interface TiptapEditorProps {
  content: Record<string, any> | null;
  onChange: (content: Record<string, any>) => void;
  placeholder?: string;
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
    className={`p-2 rounded-md transition-all duration-150 ${
      isActive
        ? 'bg-accent-1 text-white shadow-sm'
        : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
    }`}
    type="button"
    title={title}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-border-1" />;

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing your post content here...',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'code-block',
          },
        },
        strike: false, // Disable built-in strike to use our extension
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent-1 underline hover:text-accent-2',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Underline,
      Strike,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-6 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Update editor content when prop changes externally
  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border-1 rounded-lg bg-white shadow-md overflow-hidden">
      {/* Floating Toolbar */}
      <FloatingToolbar editor={editor} />

      {/* Link Popover */}
      <LinkPopover editor={editor} />

      {/* Toolbar */}
      <div className="border-b border-border-1 bg-surface-1 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Heading Dropdown */}
          <HeadingDropdown editor={editor} />

          <ToolbarDivider />

          {/* Text formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Color Picker */}
          <ColorPicker editor={editor} />

          <ToolbarDivider />

          {/* Text Alignment */}
          <TextAlignButtons editor={editor} />

          <ToolbarDivider />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Code block & blockquote */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Code Block"
            >
              <Code2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Link & Image & HR */}
          <div className="flex items-center gap-1">
            <LinkButton editor={editor} />
            <ImageUploadButton editor={editor} />
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
