import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchFromBaasAPI } from '@/lib/server/api';
import type { PostListResponse, CreatePostPayload } from '@/lib/types/post';

// Disable caching for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const blogId = searchParams.get('blog_id') || '';

  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (blogId) params.append('blog_id', blogId);

    const data = await fetchFromBaasAPI(
      `/api/v1/posts?${params.toString()}`,
      {
        method: 'GET',
        accessToken,
      }
    ) as PostListResponse;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const payload: CreatePostPayload = {
      data: {
        type: 'post',
        attributes: {
          title: body.title,
          slug: body.slug,
          excerpt: body.excerpt,
          content: body.content,
          status: body.status || 'draft',
          featured: body.featured || false,
          blog_id: body.blog_id,
          seo_title: body.seo_title,
          seo_description: body.seo_description,
          metadata: body.metadata,
        },
      },
    };

    const data = await fetchFromBaasAPI('/api/v1/posts', {
      method: 'POST',
      accessToken,
      body: payload,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}
