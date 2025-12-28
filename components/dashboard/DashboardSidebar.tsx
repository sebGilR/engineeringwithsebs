'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

interface NavItem {
  href: Route;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/posts', label: 'Posts' },
  { href: '/dashboard/posts/new', label: 'New Post' },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-surface-1 border-r border-border-1">
      <div className="p-6">
        <Link href="/" className="block mb-8">
          <h2 className="font-display text-xl font-semibold text-text-1">
            Engineering with Sebs
          </h2>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.href)
                  ? 'bg-accent-2 text-accent-1'
                  : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-border-1">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="block w-full text-left px-4 py-2 text-sm font-medium text-text-3 hover:text-text-1 hover:bg-surface-2 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
