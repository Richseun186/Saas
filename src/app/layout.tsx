import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GradeSync Nigeria",
  description:
    "Multi-tenant SaaS application for Nigerian schools to compute student results, generate report cards, and track academic performance.",
};

/**
 * Root Layout
 * -----------
 * Provides the global UI shell that wraps every page:
 *  - Sticky header with the brand name
 *  - Main content area
 *  - Footer
 *
 * The ClerkProvider will be added in a later phase when auth is wired up.
 * For now, the layout is kept dependency-light so it builds cleanly.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
      >
        {/* ── Global UI Shell ── */}
        <div className="flex flex-col min-h-screen">
          {/* ── Top Navigation ── */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <span className="font-bold sm:inline-block bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                    GradeSync Nigeria
                  </span>
                </a>
              </div>
              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <nav className="flex items-center gap-4">
                  <a
                    href="/demo"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Demo
                  </a>
                  {/* Clerk UserButton will be added here in Phase 3 */}
                </nav>
              </div>
            </div>
          </header>

          {/* ── Main Content ── */}
          <main className="flex-1">{children}</main>

          {/* ── Footer ── */}
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built for Nigerian Schools. Empowering education with data.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
