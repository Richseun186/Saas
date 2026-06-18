/**
 * Auth Layout
 * -----------
 * Bare layout for login and register pages.
 * Each page renders its own branded header.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
