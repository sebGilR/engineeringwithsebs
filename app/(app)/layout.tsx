import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { BlogProvider } from '@/lib/contexts/BlogContext';

// Disable caching for all dashboard routes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BlogProvider>
      <div className="flex min-h-screen bg-surface-0">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </BlogProvider>
  );
}
