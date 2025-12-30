import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchFromBaasAPI } from '@/lib/server/api';
import type { BlogListResponse, CreateBlogPayload } from '@/lib/types/blog';

// Disable caching for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await fetchFromBaasAPI('/api/v1/blogs', {
      method: 'GET',
      accessToken,
    }) as BlogListResponse;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blogs' },
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

    const payload: CreateBlogPayload = {
      data: {
        type: 'blog',
        attributes: {
          name: body.name || 'Engineering with Sebs',
          slug: body.slug || 'engineeringwithsebs',
          description: body.description || 'A blog about software engineering',
          status: 'active',
        },
      },
    };

    const data = await fetchFromBaasAPI('/api/v1/blogs', {
      method: 'POST',
      accessToken,
      body: payload,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog' },
      { status: 500 }
    );
  }
}
