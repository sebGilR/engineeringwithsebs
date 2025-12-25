'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Blog } from '@/lib/types/blog';

interface BlogContextType {
  blog: Blog | null;
  loading: boolean;
  error: string | null;
  refetchBlog: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: React.ReactNode }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/blogs');

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch blog');
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // User has a blog, use the first one
        setBlog(data.data[0]);
      } else {
        // No blog exists, create one automatically
        await createDefaultBlog();
      }
    } catch (err: any) {
      console.error('Error fetching blog:', err);
      setError(err.message || 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultBlog = async () => {
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Engineering with Sebs',
          slug: 'engineeringwithsebs',
          description: 'A blog about software engineering',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create blog');
      }

      const data = await response.json();
      setBlog(data.data);
    } catch (err: any) {
      console.error('Error creating blog:', err);
      setError(err.message || 'Failed to create blog');
    }
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  const refetchBlog = async () => {
    await fetchBlog();
  };

  return (
    <BlogContext.Provider value={{ blog, loading, error, refetchBlog }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}
