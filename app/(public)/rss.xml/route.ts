import { fetchFromBaasAPI } from '@/lib/server/api';
import { PostListResponse } from '@/lib/types/post';

const DEFAULT_BLOG_SLUG =
  process.env.NEXT_PUBLIC_BLOG_SLUG || 'engineeringwithsebs';

async function getAllPublishedPosts() {
  try {
    const response = await fetchFromBaasAPI(
      `/api/v1/public/blogs/${DEFAULT_BLOG_SLUG}/posts?per_page=100&sort=-published_at`
    );
    return response as PostListResponse;
  } catch (error) {
    console.error('Error fetching posts for RSS:', error);
    return null;
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const response = await getAllPublishedPosts();
  const posts = response?.data || [];

  const items = posts
    .map((post) => {
      const { title, excerpt, content_html, slug, published_at } =
        post.attributes;
      const postUrl = `${siteUrl}/blog/${DEFAULT_BLOG_SLUG}/${slug}`;

      const description = excerpt || content_html?.slice(0, 200) || '';
      const pubDate = published_at
        ? new Date(published_at).toUTCString()
        : new Date().toUTCString();

      return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      ${content_html ? `<content:encoded><![CDATA[${content_html}]]></content:encoded>` : ''}
    </item>`;
    })
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Engineering with Sebs</title>
  <link>${siteUrl}</link>
  <description>An engineering notebook in public. Notes on systems, decisions, and tradeoffs.</description>
  <language>en-us</language>
  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
</channel>
</rss>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
