// Mark this layout section as dynamic to prevent prerendering errors with useUser hook
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
