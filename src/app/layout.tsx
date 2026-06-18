import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import UserNav from "@/components/shared/UserNav";

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
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-teal-500/30`}
        suppressHydrationWarning
      >
        {/* ── Global UI Shell ── */}
        <div className="flex flex-col min-h-screen">
          {/* ── Top Navigation (Glassmorphic) ── */}
          <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
            <div className="container flex h-16 items-center">
              <div className="mr-4 flex">
                <a className="mr-6 flex items-center space-x-2 hover:opacity-80 transition-opacity" href="/">
                  <span className="font-bold text-lg sm:inline-block bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent text-glow">
                    GradeSync Nigeria
                  </span>
                </a>
              </div>
              <div className="flex flex-1 items-center justify-end space-x-4">
                <nav className="flex items-center gap-6">
                  <a
                    href="/demo"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Demo
                  </a>
                  <UserNav />
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
