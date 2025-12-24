export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Add public layout components here, e.g., header, footer */}
      <main>{children}</main>
    </div>
  );
}
