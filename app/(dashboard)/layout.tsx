export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 py-8 md:py-10">{children}</section>
  );
}
