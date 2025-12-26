import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchFromBaasAPI } from '@/lib/server/api';
import { PostResponse } from '@/lib/types/post';

interface PageProps {
  params: Promise<{ blogSlug: string; postSlug: string }>;
}

async function getPublicPost(blogSlug: string, postSlug: string) {
  try {
    const response = await fetchFromBaasAPI(
      `/api/v1/public/blogs/${blogSlug}/posts/${postSlug}`,
      {
        next: {
          tags: [`post:${blogSlug}/${postSlug}`, `posts:list:${blogSlug}`],
          revalidate: 86_400,
        },
      }
    );
    return response as PostResponse;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { blogSlug, postSlug } = await params;
  const response = await getPublicPost(blogSlug, postSlug);

  if (!response?.data) {
    return {
      title: 'Post Not Found',
    };
  }

  const post = response.data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const postUrl = `${siteUrl}/blog/${blogSlug}/${postSlug}`;

  const title = post.attributes.seo_title || post.attributes.title;
  const description =
    post.attributes.seo_description ||
    post.attributes.excerpt ||
    post.attributes.content_text?.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: postUrl,
      type: 'article',
      publishedTime: post.attributes.published_at || undefined,
      modifiedTime: post.attributes.updated_at,
      authors: post.relationships?.author
        ? [post.relationships.author.data.id]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { blogSlug, postSlug } = await params;
  const response = await getPublicPost(blogSlug, postSlug);

  if (!response?.data) {
    notFound();
  }

  const post = response.data;
  const {
    title,
    content_html,
    excerpt,
    published_at,
    reading_time_minutes,
    updated_at,
  } = post.attributes;

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6">
        <Link
          href="/"
          className="text-sm text-text-3 hover:text-text-1 transition-colors inline-flex items-center gap-1"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </nav>

      {/* Article Header */}
      <header className="mb-8 border-b pb-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{title}</h1>

        {excerpt && (
          <p className="mb-4 text-xl text-muted-foreground">{excerpt}</p>
        )}

        {/* Article Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {published_at && (
            <time dateTime={published_at}>
              {new Date(published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}

          {reading_time_minutes && (
            <span>{reading_time_minutes} min read</span>
          )}

          {updated_at && published_at !== updated_at && (
            <span className="text-xs">
              Updated {new Date(updated_at).toLocaleDateString('en-US')}
            </span>
          )}
        </div>
      </header>

      {/* Article Content */}
      {content_html && (
        <div
          className="prose prose-lg dark:prose-invert mx-auto"
          dangerouslySetInnerHTML={{ __html: content_html }}
        />
      )}
    </article>
  );
}
