import { auth } from "@/auth";
import { getStudentReportCard } from "@/actions/student";
import ReportCard from "@/components/shared/ReportCard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MonitorPlay } from "lucide-react";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const reportCardData = await getStudentReportCard(session.user.id);

  return (
    <div className="container py-8 animate-fade-in space-y-8 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent w-fit">
          Student Portal
        </h1>
        <p className="text-muted-foreground">
          View your academic performance and download your report card.
        </p>
      </div>

      {!reportCardData ? (
        <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground mt-8">
          No report card data available for the current term. Please check back later.
        </div>
      ) : (
        <div className="py-4">
          <ReportCard {...reportCardData} />
        </div>
      )}

      {/* ── Quick Links ── */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h2 className="font-semibold text-lg">Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/student/cbt"
            className="flex items-start gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 p-5 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <MonitorPlay className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">CBT Exams</p>
              <p className="text-xs text-muted-foreground mt-0.5">Take computer-based tests</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
