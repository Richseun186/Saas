import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyAllocations } from "@/actions/subject-allocation";
import { BookOpen, Users, GraduationCap, ClipboardList, MonitorPlay } from "lucide-react";
import Link from "next/link";

export default async function SubjectTeacherDashboard() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const roles = session.user.roles || [];
  if (!roles.includes("SUBJECT_TEACHER") && !roles.includes("ADMIN")) {
    redirect("/student");
  }

  const { allocations, activeTerm } = await getMyAllocations();

  return (
    <div className="container py-10 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">
          {activeTerm
            ? `Current Term: ${activeTerm.name}`
            : "No active term. Please contact your administrator."}
        </p>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-teal-400" />}
          label="Subjects Assigned"
          value={allocations.length}
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-violet-400" />}
          label="Classes"
          value={new Set(allocations.map((a) => a.classId)).size}
        />
        <StatCard
          icon={<GraduationCap className="w-5 h-5 text-amber-400" />}
          label="Active Term"
          value={activeTerm ? "1" : "0"}
        />
        <StatCard
          icon={<ClipboardList className="w-5 h-5 text-rose-400" />}
          label="Pending Entries"
          value={allocations.length}
        />
      </div>

      {/* ── Allocation Cards ── */}
      {allocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <BookOpen className="w-12 h-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-muted-foreground">No Subjects Assigned Yet</h3>
          <p className="text-sm text-muted-foreground/60 max-w-sm">
            Your administrator has not yet assigned any subjects to you for this term. Please check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Your Assigned Subjects</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allocations.map((allocation) => (
              <AllocationCard key={allocation.id} allocation={allocation} />
            ))}
          </div>
        </div>
      )}
      {/* ── CBT Quick Link ── */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h2 className="font-semibold text-lg">Tools</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/subject-teacher/cbt"
            className="flex items-start gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 p-5 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <MonitorPlay className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">CBT Management</p>
              <p className="text-xs text-muted-foreground mt-0.5">Create & manage computer-based tests</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4">
      <div className="p-2 rounded-lg bg-white/5">{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function AllocationCard({
  allocation,
}: {
  allocation: {
    id: string;
    class: { id: string; name: string };
    schoolSubject: { subjectBank: { name: string } };
    sessionTerm: { name: string };
  };
}) {
  const subjectName = allocation.schoolSubject.subjectBank.name;
  const className = allocation.class.name;

  const colors = [
    "from-teal-500/20 to-emerald-500/20 border-teal-500/30",
    "from-violet-500/20 to-purple-500/20 border-violet-500/30",
    "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    "from-rose-500/20 to-pink-500/20 border-rose-500/30",
    "from-sky-500/20 to-blue-500/20 border-sky-500/30",
  ];
  const colorClass = colors[subjectName.charCodeAt(0) % colors.length];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorClass} p-5 space-y-4 group hover:scale-[1.02] transition-all duration-200`}
    >
      {/* Subject name */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
            Subject
          </p>
          <h3 className="text-lg font-bold">{subjectName}</h3>
        </div>
        <BookOpen className="w-6 h-6 text-muted-foreground/40 mt-1" />
      </div>

      {/* Class badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium">
          <Users className="w-3 h-3" />
          {className}
        </span>
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-muted-foreground">
          {allocation.sessionTerm.name}
        </span>
      </div>

      {/* CTA */}
      <button className="w-full rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 py-2 text-sm font-medium transition-colors">
        Enter Grades →
      </button>
    </div>
  );
}
