import { auth } from "@/auth";
import { getFormMasterClasses, getActiveTerm, getSchoolSubjects } from "@/actions/grading";
import FormMasterWorkspace from "./FormMasterWorkspace";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, Activity, Printer } from "lucide-react";

export default async function FormMasterDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const classes = await getFormMasterClasses(session.user.id);
  const term = await getActiveTerm(classes[0]?.schoolId || "");
  const subjects = await getSchoolSubjects(classes[0]?.schoolId || "");

  return (
    <div className="container py-8 animate-fade-in space-y-8 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6 relative">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent w-fit">
          Form Master Dashboard
        </h1>
        <p className="text-muted-foreground">
          Select your class and subject to enter continuous assessment and exam scores.
        </p>
      </div>

      {!term ? (
        <div className="glass-card rounded-2xl p-8 text-center text-red-400 border-red-500/20 mt-8">
          No active term found. Please contact the Administrator to start a new academic term.
        </div>
      ) : (
        <FormMasterWorkspace
          classes={classes}
          subjects={subjects}
          termId={term.id}
        />
      )}

      {/* ── Quick Links ── */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Other Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/form-master/domains"
            className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-violet-500/10 hover:border-violet-500/30 p-5 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-colors">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Behavioural Domains</p>
              <p className="text-xs text-muted-foreground mt-0.5">Score affective & psychomotor traits</p>
            </div>
          </Link>
          <Link
            href="/form-master/attendance"
            className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-sky-500/10 hover:border-sky-500/30 p-5 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Attendance</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mark daily class attendance</p>
            </div>
          </Link>
          <Link
            href="/form-master/report-cards"
            className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/30 p-5 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Print Report Cards</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generate PDFs for students</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
