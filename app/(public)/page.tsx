import { AppShell } from '@/components/layout/AppShell';
import { Container } from '@/components/layout/Container';

export default function HomePage() {
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
              An engineering notebook in public. Notes on systems, decisions, and tradeoffs.
            </p>
          </header>

          {/* Latest Posts Section */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-text-1 mb-8">
              Recent Thoughts
            </h2>

            {/* Placeholder for posts - will be replaced with actual data */}
            <div className="space-y-12">
              <article className="border-l-2 border-border-1 pl-6">
                <p className="text-sm text-text-3 mb-2">Coming soon</p>
                <h3 className="font-display text-xl font-semibold text-text-1 mb-2">
                  First Post
                </h3>
                <p className="text-text-2 leading-relaxed">
                  Currently setting up the publishing system. Posts will appear here once the editorial workflow is complete.
                </p>
              </article>
            </div>
          </section>
        </div>
      </Container>
    </AppShell>
  );
}
