import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-text-1 mb-2">
          Dashboard
        </h1>
        <p className="text-text-2">
          Welcome back. Ready to write?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/dashboard/posts"
          className="block p-6 bg-surface-1 border border-border-1 rounded-lg hover:border-accent-1 transition-colors"
        >
          <h2 className="font-display text-xl font-semibold text-text-1 mb-2">
            Your Posts
          </h2>
          <p className="text-sm text-text-3">
            View and manage all your published and draft posts.
          </p>
        </Link>

        <Link
          href="/dashboard/posts/new"
          className="block p-6 bg-surface-1 border border-border-1 rounded-lg hover:border-accent-1 transition-colors"
        >
          <h2 className="font-display text-xl font-semibold text-text-1 mb-2">
            New Post
          </h2>
          <p className="text-sm text-text-3">
            Start writing a new post from scratch.
          </p>
        </Link>

        <Link
          href="/"
          className="block p-6 bg-surface-1 border border-border-1 rounded-lg hover:border-accent-1 transition-colors"
        >
          <h2 className="font-display text-xl font-semibold text-text-1 mb-2">
            View Site
          </h2>
          <p className="text-sm text-text-3">
            See how your published posts look to readers.
          </p>
        </Link>
      </div>
    </div>
  );
}
