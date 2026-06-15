import Link from "next/link";
import { GraduationCap, BookOpen, BarChart3, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center max-w-3xl space-y-6">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 shadow-lg shadow-teal-500/20">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
            GradeSync
          </span>{" "}
          Nigeria
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          The all-in-one SaaS platform for Nigerian primary and secondary
          schools to compute student results, generate report cards, and
          track academic performance — powered by AI.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-700 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <BarChart3 className="h-4 w-4" />
            View Demo
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
        <FeatureCard
          icon={<BookOpen className="h-6 w-6 text-teal-600" />}
          title="WAEC Standard Grading"
          description="Automatic A1–F9 grade computation following the standard Nigerian WAEC/NECO scale."
        />
        <FeatureCard
          icon={<BarChart3 className="h-6 w-6 text-emerald-600" />}
          title="Smart Broadsheets"
          description="Real-time score entry with auto-computed totals, grades, and class positions."
        />
        <FeatureCard
          icon={<Shield className="h-6 w-6 text-amber-600" />}
          title="Role-Based Access"
          description="Secure dashboards for Admins, Form Masters, and Students with Clerk auth."
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 dark:bg-slate-950">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-teal-50">
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
