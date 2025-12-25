'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_json: any;
  status: 'draft' | 'published';
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // This will be replaced with actual API call
    // For now, showing placeholder
    setLoading(false);
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // API call to save post
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert('Save functionality will be implemented when API is ready');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      // API call to publish post
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert('Publish functionality will be implemented when API is ready');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="text-center py-12 text-text-3">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/posts"
          className="text-text-3 hover:text-text-1 transition-colors"
        >
          ← Back to posts
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-surface-1 border border-border-1 text-text-1 font-medium rounded-md hover:border-accent-1 focus:outline-none focus:ring-2 focus:ring-accent-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-4 py-2 bg-accent-1 text-white font-medium rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-surface-1 border border-border-1 rounded-lg">
        {/* Title */}
        <div className="p-6 border-b border-border-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full text-3xl font-display font-semibold text-text-1 placeholder-text-3 bg-transparent border-none focus:outline-none"
          />
        </div>

        {/* Meta */}
        <div className="p-6 border-b border-border-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-2 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 bg-surface-0 border border-border-1 rounded-md text-text-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-2 mb-2">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-surface-0 border border-border-1 rounded-md text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent resize-none"
              placeholder="A brief description for cards and previews"
            />
          </div>
        </div>

        {/* Content Editor Placeholder */}
        <div className="p-6">
          <div className="mb-4 p-4 bg-accent-2 border border-accent-1 rounded-md">
            <p className="text-sm text-accent-1">
              <strong>Note:</strong> The Tiptap rich text editor will be integrated in Phase 3.
              For now, you can use this basic textarea.
            </p>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 bg-surface-0 border border-border-1 rounded-md text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent resize-y font-mono text-sm"
            placeholder="Start writing your post content here..."
          />
        </div>
      </div>

      {/* Autosave indicator placeholder */}
      <div className="mt-4 text-center">
        <p className="text-sm text-text-3">
          Autosave will be implemented in Phase 1
        </p>
      </div>
    </div>
  );
}
