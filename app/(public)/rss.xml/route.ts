export async function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Engineering with Sebs</title>
  <link>${process.env.NEXT_PUBLIC_SITE_URL}</link>
  <description>A blog about software engineering, leadership, and life.</description>
  <!-- Add items here -->
</channel>
</rss>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
