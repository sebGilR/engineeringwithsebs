import { fetchFromBaasAPI } from '@/lib/server/api';
import { PostListResponse } from '@/lib/types/post';

const DEFAULT_BLOG_SLUG =
  process.env.NEXT_PUBLIC_BLOG_SLUG || 'engineeringwithsebs';

async function getAllPublishedPosts() {
  try {
    const response = await fetchFromBaasAPI(
      `/api/v1/public/blogs/${DEFAULT_BLOG_SLUG}/posts?per_page=1000&sort=-published_at`
    );
    return response as PostListResponse;
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
    return null;
  }
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const response = await getAllPublishedPosts();
  const posts = response?.data || [];

  const postUrls = posts
    .map((post) => {
      const { slug, updated_at, published_at } = post.attributes;
      const postUrl = `${siteUrl}/blog/${DEFAULT_BLOG_SLUG}/${slug}`;
      const lastmod = updated_at || published_at || new Date().toISOString();

      return `
  <url>
    <loc>${postUrl}</loc>
    <lastmod>${lastmod.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${postUrls}
</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
