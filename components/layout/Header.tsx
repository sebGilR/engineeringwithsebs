import Link from 'next/link';
import { Container } from './Container';
import { X, Linkedin, Instagram } from 'lucide-react';

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

          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-2 hover:text-accent-1 transition-colors"
              aria-label="X (Twitter)"
            >
              <X className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com/in/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-2 hover:text-accent-1 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-2 hover:text-accent-1 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </nav>
      </Container>
    </header>
  );
}
