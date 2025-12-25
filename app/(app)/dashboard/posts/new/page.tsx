'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useBlog } from '@/lib/contexts/BlogContext';

export default function NewPostPage() {
  const router = useRouter();
  const { blog, loading: blogLoading } = useBlog();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blog) {
      setError('Blog not loaded. Please refresh the page.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || undefined,
          content: '',
          status: 'draft',
          blog_id: blog.id,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const data = await response.json();
      toast.success('Post created successfully');
      router.push(`/dashboard/posts/${data.data.id}/edit`);
    } catch (err: any) {
      console.error('Error creating post:', err);
      const errorMessage = err.message || 'Failed to create post. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/dashboard/posts"
            className="text-text-3 hover:text-text-1 transition-colors"
          >
            ← Back to posts
          </Link>
        </div>
        <h1 className="font-display text-4xl font-semibold text-text-1 mb-2">
          New Post
        </h1>
        <p className="text-text-2">
          Start with a title and slug, then begin writing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-1 border border-border-1 rounded-lg p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-2 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              required
              className="w-full px-4 py-3 bg-surface-0 border border-border-1 rounded-md text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent transition-all"
              placeholder="A clear, descriptive title"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-text-2 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface-0 border border-border-1 rounded-md text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent transition-all font-mono text-sm"
              placeholder="url-friendly-slug"
            />
            <p className="mt-2 text-xs text-text-3">
              This will be the URL: /blog/your-blog-slug/{slug || 'post-slug'}
            </p>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-text-2 mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-surface-0 border border-border-1 rounded-md text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent transition-all resize-none"
              placeholder="A brief description for cards and previews (optional)"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/posts"
            className="px-4 py-2 text-text-2 hover:text-text-1 font-medium transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || blogLoading || !title || !slug || !blog}
            className="px-6 py-3 bg-accent-1 text-white font-medium rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Creating...' : blogLoading ? 'Loading...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
