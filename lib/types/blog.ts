// JSON:API Blog types

export interface BlogAttributes {
  name: string;
  slug: string;
  description?: string;
  url?: string;
  logo_url?: string;
  favicon_url?: string;
  locale?: string;
  timezone?: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BlogRelationships {
  owner?: {
    data: {
      id: string;
      type: 'user';
    };
  };
}

export interface Blog {
  id: string;
  type: 'blog';
  attributes: BlogAttributes;
  relationships?: BlogRelationships;
}

export interface BlogResponse {
  data: Blog;
}

export interface BlogListResponse {
  data: Blog[];
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface CreateBlogPayload {
  data: {
    type: 'blog';
    attributes: {
      name: string;
      slug: string;
      description?: string;
      status?: 'active' | 'inactive';
    };
  };
}
