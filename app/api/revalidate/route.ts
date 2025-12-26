import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paths, tags, secret } = body as {
      paths?: unknown;
      tags?: unknown;
      secret?: unknown;
    };

    // Validate secret token for security
    const revalidateSecret =
      process.env.VERCEL_REVALIDATE_TOKEN || process.env.REVALIDATE_SECRET;
    if (!revalidateSecret) {
      return NextResponse.json(
        { error: 'Revalidation not configured' },
        { status: 500 }
      );
    }

    const headerToken = request.headers.get('x-revalidate-token');
    const provided = (typeof headerToken === 'string' && headerToken) || secret;

    if (provided !== revalidateSecret) {
      return NextResponse.json(
        { error: 'Invalid revalidation secret' },
        { status: 401 }
      );
    }

    const normalizedPaths = Array.isArray(paths) ? paths : [];
    const normalizedTags = Array.isArray(tags) ? tags : [];

    if (normalizedPaths.length === 0 && normalizedTags.length === 0) {
      return NextResponse.json(
        { error: 'Provide at least one path or tag to revalidate' },
        { status: 400 }
      );
    }

    // Revalidate tags (preferred for ISR fetch caching)
    for (const tag of normalizedTags) {
      if (typeof tag === 'string' && tag.length > 0) {
        revalidateTag(tag);
      }
    }

    // Revalidate each path
    for (const path of normalizedPaths) {
      if (typeof path === 'string' && path.length > 0) {
        revalidatePath(path);
      }
    }

    return NextResponse.json({
      revalidated: true,
      tags: normalizedTags,
      paths: normalizedPaths,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Error revalidating paths' },
      { status: 500 }
    );
  }
}
