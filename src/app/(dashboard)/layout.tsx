import UserNav from "@/components/shared/UserNav";

/**
 * Dashboard Layout
 * ----------------
 * Provides the sticky nav header for all authenticated dashboard pages.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Top Navigation (Glassmorphic) ── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2 hover:opacity-80 transition-opacity" href="/">
              <span className="font-bold text-lg sm:inline-block bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                GradeSync Nigeria
              </span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center gap-6">
              <UserNav />
            </nav>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for Nigerian Schools. Empowering education with data.
          </p>
        </div>
      </footer>
    </div>
  );
}
