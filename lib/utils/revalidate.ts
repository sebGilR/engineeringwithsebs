/**
 * Triggers cache revalidation for specific paths
 * Call this after publishing, unpublishing, or updating posts
 */
export async function revalidatePaths(paths: string[]): Promise<boolean> {
  return revalidate({ paths });
}

/**
 * Triggers cache revalidation for tags and/or paths.
 * Intended for ISR (`fetch(..., { next: { tags: [...] } })`) + path invalidation as a fallback.
 */
export async function revalidate({
  tags = [],
  paths = [],
}: {
  tags?: string[];
  paths?: string[];
}): Promise<boolean> {
  try {
    const token =
      process.env.VERCEL_REVALIDATE_TOKEN || process.env.REVALIDATE_SECRET;
    if (!token) {
      console.warn(
        'VERCEL_REVALIDATE_TOKEN/REVALIDATE_SECRET not configured, skipping revalidation'
      );
      return false;
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Revalidate-Token': token,
      },
      body: JSON.stringify({
        tags,
        paths,
      }),
    });

    if (!response.ok) {
      console.error('Revalidation failed:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error triggering revalidation:', error);
    return false;
  }
}

/**
 * Revalidates paths related to a blog post
 */
export async function revalidatePostPaths(
  blogSlug: string,
  postSlug: string
): Promise<boolean> {
  const tags = [`posts:list:${blogSlug}`, `post:${blogSlug}/${postSlug}`];
  const paths = ['/', `/blog/${blogSlug}/${postSlug}`, '/sitemap.xml', '/rss.xml'];

  return revalidate({ tags, paths });
}
