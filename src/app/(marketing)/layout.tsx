/**
 * Marketing Layout
 * ----------------
 * A bare layout for the landing page, register, and other public marketing pages.
 * No global nav or footer — each page renders its own.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
