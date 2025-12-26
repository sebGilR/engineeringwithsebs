import { AppShell } from '@/components/layout/AppShell';
import { Container } from '@/components/layout/Container';
import { fetchFromBaasAPI } from '@/lib/server/api';
import { PostListResponse } from '@/lib/types/post';
import Link from 'next/link';

const DEFAULT_BLOG_SLUG =
  process.env.NEXT_PUBLIC_BLOG_SLUG || 'engineeringwithsebs';

async function getRecentPosts() {
  try {
    const response = await fetchFromBaasAPI(
      `/api/v1/public/blogs/${DEFAULT_BLOG_SLUG}/posts?per_page=10&sort=-published_at`,
      {
        next: { tags: [`posts:list:${DEFAULT_BLOG_SLUG}`], revalidate: 3600 },
      }
    );
    return response as PostListResponse;
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return null;
  }
}

export default async function HomePage() {
  const response = await getRecentPosts();
  const posts = response?.data || [];

  return (
    <AppShell>
      <Container size="content">
        <div className="py-20">
          {/* Header Section */}
          <header className="mb-16">
            <h1 className="font-display text-5xl font-semibold tracking-tight text-text-1 mb-4">
              Engineering with Sebs
            </h1>
            <p className="text-lg text-text-2 leading-relaxed max-w-2xl">
              An engineering notebook in public. Notes on systems, decisions,
              and tradeoffs.
            </p>
          </header>

          {/* Latest Posts Section */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-text-1 mb-8">
              Recent Thoughts
            </h2>

            {posts.length === 0 ? (
              <div className="space-y-12">
                <article className="border-l-2 border-border-1 pl-6">
                  <p className="text-sm text-text-3 mb-2">Coming soon</p>
                  <h3 className="font-display text-xl font-semibold text-text-1 mb-2">
                    First Post
                  </h3>
                  <p className="text-text-2 leading-relaxed">
                    Currently setting up the publishing system. Posts will
                    appear here once the editorial workflow is complete.
                  </p>
                </article>
              </div>
            ) : (
              <div className="space-y-12">
                {posts.map((post) => {
                  const {
                    title,
                    excerpt,
                    slug,
                    published_at,
                    reading_time_minutes,
                  } = post.attributes;

                  return (
                    <article
                      key={post.id}
                      className="border-l-2 border-border-1 pl-6 hover:border-text-1 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-sm text-text-3 mb-2">
                        {published_at && (
                          <time dateTime={published_at}>
                            {new Date(published_at).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </time>
                        )}
                        {reading_time_minutes && (
                          <>
                            <span>·</span>
                            <span>{reading_time_minutes} min read</span>
                          </>
                        )}
                      </div>

                      <Link
                        href={`/blog/${DEFAULT_BLOG_SLUG}/${slug}`}
                        className="group"
                      >
                        <h3 className="font-display text-xl font-semibold text-text-1 mb-2 group-hover:text-accent-1 transition-colors">
                          {title}
                        </h3>
                      </Link>

                      {excerpt && (
                        <p className="text-text-2 leading-relaxed">{excerpt}</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </Container>
    </AppShell>
  );
}
