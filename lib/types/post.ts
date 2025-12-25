// JSON:API Post types

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface PostAttributes {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  content_json?: Record<string, any>;
  content_html?: string;
  content_text?: string;
  status: PostStatus;
  published_at?: string | null;
  featured: boolean;
  reading_time_minutes?: number;
  seo_title?: string;
  seo_description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PostRelationships {
  blog?: {
    data: {
      id: string;
      type: 'blog';
    };
  };
  author?: {
    data: {
      id: string;
      type: 'user';
    };
  };
  tags?: {
    data: Array<{
      id: string;
      type: 'tag';
    }>;
  };
}

export interface Post {
  id: string;
  type: 'post';
  attributes: PostAttributes;
  relationships?: PostRelationships;
}

export interface PostResponse {
  data: Post;
}

export interface PostListResponse {
  data: Post[];
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface CreatePostPayload {
  data: {
    type: 'post';
    attributes: {
      title: string;
      slug: string;
      excerpt?: string;
      content?: string;
      content_json?: Record<string, any>;
      status?: PostStatus;
      featured?: boolean;
      blog_id: string;
      seo_title?: string;
      seo_description?: string;
      metadata?: Record<string, any>;
    };
  };
}

export interface UpdatePostPayload {
  data: {
    type: 'post';
    attributes: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      content_json?: Record<string, any>;
      status?: PostStatus;
      featured?: boolean;
      seo_title?: string;
      seo_description?: string;
      metadata?: Record<string, any>;
    };
  };
}
