export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Add dashboard layout components here, e.g., sidebar */}
      <main>{children}</main>
    </div>
  );
}
