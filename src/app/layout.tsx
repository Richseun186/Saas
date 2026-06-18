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
 * Minimal wrapper — just HTML/body/fonts.
 * Each route group (marketing, auth, dashboard) provides its own shell.
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
        {children}
      </body>
    </html>
  );
}
