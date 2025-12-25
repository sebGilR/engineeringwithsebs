/**
 * Triggers cache revalidation for specific paths
 * Call this after publishing, unpublishing, or updating posts
 */
export async function revalidatePaths(paths: string[]): Promise<boolean> {
  try {
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret) {
      console.warn('REVALIDATE_SECRET not configured, skipping revalidation');
      return false;
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths,
        secret,
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
  const paths = [
    '/', // Homepage
    `/blog/${blogSlug}/${postSlug}`, // Post page
    '/sitemap.xml', // Sitemap
    '/rss.xml', // RSS feed
  ];

  return revalidatePaths(paths);
}
