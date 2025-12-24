import Link from 'next/link';
import { Container } from './Container';

export function Header() {
  return (
    <header className="border-b border-border-1 bg-surface-1">
      <Container size="wide">
        <nav className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="font-display text-xl font-semibold text-text-1 hover:text-accent-1 transition-colors"
          >
            Engineering with Sebs
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-text-2 hover:text-text-1 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-text-2 hover:text-text-1 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}
