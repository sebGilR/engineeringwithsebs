import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchFromBaasAPI } from '@/lib/server/api';

// Disable caching for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await fetchFromBaasAPI(`/api/v1/blogs/${id}`, {
      method: 'GET',
      accessToken,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const payload = {
      data: {
        type: 'blog',
        attributes: body,
      },
    };

    const data = await fetchFromBaasAPI(`/api/v1/blogs/${id}`, {
      method: 'PATCH',
      accessToken,
      body: payload,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await fetchFromBaasAPI(`/api/v1/blogs/${id}`, {
      method: 'DELETE',
      accessToken,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
