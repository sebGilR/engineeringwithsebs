'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useBlog } from '@/lib/contexts/BlogContext';
import type { Post } from '@/lib/types/post';

export default function PostsPage() {
  const { blog, loading: blogLoading } = useBlog();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');

  useEffect(() => {
    const fetchPosts = async () => {
      if (!blog) return;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('blog_id', blog.id);
        if (filter !== 'all') {
          params.append('status', filter);
        }

        const response = await fetch(`/api/posts?${params.toString()}`);

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/login';
            return;
          }
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        setPosts(data.data || []);
      } catch (err: any) {
        console.error('Error fetching posts:', err);
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    if (!blogLoading && blog) {
      fetchPosts();
    }
  }, [blog, blogLoading, filter]);

  const isLoading = blogLoading || loading;

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold text-text-1 mb-2">
            Posts
          </h1>
          <p className="text-text-2">
            Manage your drafts and published work.
          </p>
        </div>

        <Link
          href="/dashboard/posts/new"
          className="px-4 py-2 bg-accent-1 text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
        >
          New Post
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-border-1">
        <nav className="flex gap-6">
          {(['all', 'draft', 'published'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                filter === tab
                  ? 'border-accent-1 text-accent-1'
                  : 'border-transparent text-text-3 hover:text-text-1'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Posts List */}
      {isLoading ? (
        <div className="text-center py-12 text-text-3">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-surface-1 border border-border-1 rounded-lg">
          <p className="text-text-2 mb-4">No posts yet.</p>
          <Link
            href="/dashboard/posts/new"
            className="inline-block px-4 py-2 bg-accent-1 text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
          >
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/dashboard/posts/${post.id}/edit`}
              className="block p-6 bg-surface-1 border border-border-1 rounded-lg hover:border-accent-1 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-lg font-semibold text-text-1">
                      {post.attributes.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        post.attributes.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {post.attributes.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-3">/{post.attributes.slug}</p>
                </div>
                <time className="text-sm text-text-3">
                  {new Date(post.attributes.updated_at).toLocaleDateString()}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
