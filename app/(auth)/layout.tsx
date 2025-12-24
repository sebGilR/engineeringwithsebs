export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Add auth layout components here */}
      <main>{children}</main>
    </div>
  );
}
