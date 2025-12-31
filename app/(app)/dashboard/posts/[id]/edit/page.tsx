'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { toast } from 'sonner';
import type { Post, PostStatus } from '@/lib/types/post';
import { TiptapEditor } from '@/components/editor/TiptapEditor';

const DEFAULT_BLOG_SLUG =
  process.env.NEXT_PUBLIC_BLOG_SLUG || 'engineeringwithsebs';

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [contentJson, setContentJson] = useState<Record<string, any> | null>(
    null
  );
  const [status, setStatus] = useState<PostStatus>('draft');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/${id}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/login';
            return;
          }
          throw new Error('Failed to fetch post');
        }

        const data = await response.json();
        const postData = data.data;

        setPost(postData);
        setTitle(postData.attributes.title);
        setSlug(postData.attributes.slug);
        setSlugManuallyEdited(true); // Existing posts have their slug set
        setExcerpt(postData.attributes.excerpt || '');

        // Use content_json if available, otherwise create empty editor state
        setContentJson(
          postData.attributes.content_json || {
            type: 'doc',
            content: [],
          }
        );

        setStatus(postData.attributes.status);
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Track changes to form fields
  useEffect(() => {
    if (post && !loading) {
      const hasChanges =
        title !== post.attributes.title ||
        slug !== post.attributes.slug ||
        excerpt !== (post.attributes.excerpt || '') ||
        JSON.stringify(contentJson) !==
          JSON.stringify(post.attributes.content_json || { type: 'doc', content: [] });

      setHasUnsavedChanges(hasChanges);
    }
  }, [title, slug, excerpt, contentJson, post, loading]);

  // Autosave effect
  useEffect(() => {
    if (!hasUnsavedChanges || saving) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      handleAutosave();
    }, 1000);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, title, slug, excerpt, contentJson, saving]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Auto-generate slug only if it hasn't been manually edited
    if (!slugManuallyEdited && newTitle) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);
    setSlugManuallyEdited(true);
  };

  const handleAutosave = async () => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content_json: contentJson,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Autosave failed:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content_json: contentJson,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to save post');
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('Draft saved successfully');
    } catch (err: any) {
      console.error('Error saving post:', err);
      const errorMessage = err.message || 'Failed to save post';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    setError(null);

    try {
      // First save current changes
      if (hasUnsavedChanges) {
        const saveResponse = await fetch(`/api/posts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            slug,
            excerpt,
            content_json: contentJson,
          }),
        });

        if (!saveResponse.ok) {
          throw new Error('Failed to save changes before publishing');
        }

        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }

      // Then publish
      const response = await fetch(`/api/posts/${id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish post');
      }

      setStatus('published');
      toast.success('Post published successfully');

      // Trigger frontend-driven cache revalidation for public views
      fetch('/api/dashboard/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          tags: [
            `posts:list:${DEFAULT_BLOG_SLUG}`,
            `post:${DEFAULT_BLOG_SLUG}/${slug}`,
          ],
          paths: [
            '/',
            `/blog/${DEFAULT_BLOG_SLUG}/${slug}`,
            '/sitemap.xml',
            '/rss.xml',
          ],
        }),
      }).catch((err) => {
        console.error('Revalidation after publish failed:', err);
      });
    } catch (err: any) {
      console.error('Error publishing post:', err);
      const errorMessage = err.message || 'Failed to publish post';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${id}/unpublish`, {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to unpublish post');
      }

      setStatus('draft');
      toast.success('Post unpublished successfully');

      // Trigger cache revalidation so the post disappears from public lists
      fetch('/api/dashboard/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          tags: [
            `posts:list:${DEFAULT_BLOG_SLUG}`,
            `post:${DEFAULT_BLOG_SLUG}/${slug}`,
          ],
          paths: [
            '/',
            `/blog/${DEFAULT_BLOG_SLUG}/${slug}`,
            '/sitemap.xml',
            '/rss.xml',
          ],
        }),
      }).catch((err) => {
        console.error('Revalidation after unpublish failed:', err);
      });
    } catch (err: any) {
      console.error('Error unpublishing post:', err);
      const errorMessage = err.message || 'Failed to unpublish post';
      setError(errorMessage);
      toast.error(errorMessage);
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

  if (error && !post) {
    return (
      <div className="max-w-5xl">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
        <Link
          href="/dashboard/posts"
          className="text-accent-1 hover:underline"
        >
          ← Back to posts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/posts"
            className="text-text-3 hover:text-text-1 transition-colors"
          >
            ← Back to posts
          </Link>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              status === 'published'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="px-4 py-2 bg-surface-1 border border-border-1 text-text-1 font-medium rounded-md hover:border-accent-1 focus:outline-none focus:ring-2 focus:ring-accent-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {status === 'published' ? (
            <button
              onClick={handleUnpublish}
              disabled={saving}
              className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-4 py-2 bg-accent-1 text-white font-medium rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Editor */}
      <div className="bg-surface-1 border border-border-1 rounded-lg">
        {/* Title */}
        <div className="p-6 border-b border-border-1">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
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
              onChange={(e) => handleSlugChange(e.target.value)}
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

        {/* Content Editor */}
        <div className="p-6">
          <TiptapEditor
            content={contentJson}
            onChange={setContentJson}
            placeholder="Start writing your post content here..."
          />
        </div>
      </div>

      {/* Autosave indicator */}
      <div className="mt-4 text-center">
        <p className="text-sm text-text-3">
          {hasUnsavedChanges ? (
            'Unsaved changes...'
          ) : lastSaved ? (
            `Last saved at ${lastSaved.toLocaleTimeString()}`
          ) : (
            'All changes saved'
          )}
        </p>
      </div>
    </div>
  );
}
