import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { BlogProvider } from '@/lib/contexts/BlogContext';

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
