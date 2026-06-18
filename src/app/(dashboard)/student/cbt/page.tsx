import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getActiveTerm } from "@/actions/grading";
import { getStudentExams } from "@/actions/cbt";
import Link from "next/link";
import { BookOpen, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default async function StudentCbtPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const roles = session.user.roles || [];
  if (!roles.includes("STUDENT") && !roles.includes("ADMIN")) redirect("/admin");

  // Get student's enrollment to find school
  const { db } = await import("@/lib/db");
  const enrollment = await db.enrollment.findFirst({
    where: { studentId: session.user.id },
    include: { sessionTerm: { select: { schoolId: true } } }
  });

  if (!enrollment) {
    return (
      <div className="container py-10">
        <p className="text-muted-foreground text-center py-20 border border-dashed border-white/10 rounded-2xl">
          You are not enrolled in any class. Contact your school administrator.
        </p>
      </div>
    );
  }

  const term = await getActiveTerm(enrollment.sessionTerm.schoolId);
  if (!term) {
    return (
      <div className="container py-10">
        <p className="text-muted-foreground text-center py-20 border border-dashed border-white/10 rounded-2xl">
          No active term found.
        </p>
      </div>
    );
  }

  const exams = await getStudentExams(session.user.id, term.id);

  return (
    <div className="container py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent w-fit">
          Available Exams
        </h1>
        <p className="text-muted-foreground mt-1">
          Computer-based tests available for your class this term.
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-2xl gap-4">
          <BookOpen className="w-14 h-14 text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">No exams available yet.</p>
          <p className="text-sm text-muted-foreground">Your teacher hasn&apos;t published any CBT exams yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map(exam => {
            const attempt = exam.attempts[0] || null;
            const isSubmitted = attempt?.status === "SUBMITTED";
            const isOngoing = attempt?.status === "ONGOING";

            return (
              <div key={exam.id} className={`glass-card rounded-2xl border overflow-hidden hover-lift transition-all ${isSubmitted ? "border-teal-500/20" : isOngoing ? "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "border-white/10 hover:border-blue-500/30"}`}>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    {isSubmitted && (
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-teal-500/20 text-teal-400 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                      </span>
                    )}
                    {isOngoing && (
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" /> In Progress
                      </span>
                    )}
                    {!attempt && (
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full">
                        Not Started
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg leading-tight">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{exam.schoolSubject.subjectBank.name}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {exam.durationMinutes} mins
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> {exam._count.questions} Questions
                    </span>
                  </div>

                  {isSubmitted ? (
                    <div className="w-full flex items-center justify-between bg-teal-500/10 rounded-xl p-3">
                      <span className="text-sm text-teal-300 font-medium">Your Score</span>
                      <span className="text-2xl font-bold text-teal-400">{attempt.score} / {exam.totalMarks}</span>
                    </div>
                  ) : (
                    <Link
                      href={`/student/cbt/${exam.id}/take`}
                      className={`block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${isOngoing ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30" : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 shadow-[0_0_15px_rgba(59,130,246,0.3)]"}`}
                    >
                      {isOngoing ? "Resume Exam →" : "Start Exam →"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
