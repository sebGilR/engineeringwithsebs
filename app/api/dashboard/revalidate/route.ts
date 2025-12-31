import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic to ensure cache invalidation runs
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Payload = {
  tags?: string[];
  paths?: string[];
};

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  // Require dashboard auth (middleware sets this cookie)
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const tags = Array.isArray(body.tags) ? body.tags : [];
  const paths = Array.isArray(body.paths) ? body.paths : [];

  if (tags.length === 0 && paths.length === 0) {
    return NextResponse.json(
      { error: 'Provide at least one tag or path' },
      { status: 400 }
    );
  }

  tags.forEach((tag) => {
    if (typeof tag === 'string' && tag.length > 0) {
      revalidateTag(tag);
    }
  });

  paths.forEach((path) => {
    if (typeof path === 'string' && path.length > 0) {
      revalidatePath(path);
    }
  });

  return NextResponse.json({
    revalidated: true,
    tags,
    paths,
    timestamp: new Date().toISOString(),
  });
}
