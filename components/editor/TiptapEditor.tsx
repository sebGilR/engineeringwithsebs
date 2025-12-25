'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import './editor.css';

interface TiptapEditorProps {
  content: Record<string, any> | null;
  onChange: (content: Record<string, any>) => void;
  placeholder?: string;
}

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
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-4 py-3',
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
    <div className="border border-border-1 rounded-md bg-surface-0">
      {/* Toolbar */}
      <div className="border-b border-border-1 p-2 flex flex-wrap gap-1">
        {/* Text formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('bold')
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('italic')
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`px-3 py-1 rounded text-sm font-medium font-mono transition-colors ${
            editor.isActive('code')
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          Code
        </button>

        <div className="w-px bg-border-1 mx-1" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          H3
        </button>

        <div className="w-px bg-border-1 mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          Bullet List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          Numbered List
        </button>

        <div className="w-px bg-border-1 mx-1" />

        {/* Code block & blockquote */}
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 rounded text-sm font-medium font-mono transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          Code Block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          Quote
        </button>

        <div className="w-px bg-border-1 mx-1" />

        {/* Link */}
        <button
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('link')
              ? 'bg-accent-1 text-white'
              : 'bg-surface-1 text-text-1 hover:bg-surface-2'
          }`}
          type="button"
        >
          Link
        </button>

        <div className="w-px bg-border-1 mx-1" />

        {/* Horizontal rule */}
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1 rounded text-sm font-medium bg-surface-1 text-text-1 hover:bg-surface-2 transition-colors"
          type="button"
        >
          HR
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
