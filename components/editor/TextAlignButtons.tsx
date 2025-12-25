'use client';

import { Editor } from '@tiptap/react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface TextAlignButtonsProps {
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

export function TextAlignButtons({ editor }: TextAlignButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        isActive={editor.isActive({ textAlign: 'justify' })}
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}
