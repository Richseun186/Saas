import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getFormMasterClasses, getActiveTerm } from "@/actions/grading";
import Link from "next/link";
import { Printer, GraduationCap, ChevronRight } from "lucide-react";

export default async function FormMasterReportCardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const classes = await getFormMasterClasses(session.user.id);
  if (classes.length === 0) {
    return (
      <div className="container py-8 text-center text-muted-foreground">
        You are not assigned as a form master for any class.
      </div>
    );
  }

  const schoolId = classes[0].schoolId;
  const activeTerm = await getActiveTerm(schoolId);

  if (!activeTerm) {
    return (
      <div className="container py-8 text-center text-muted-foreground">
        No active term found.
      </div>
    );
  }

  // Get all students enrolled in the first class assigned to this form master
  const classId = classes[0].id;
  const enrollments = await db.enrollment.findMany({
    where: {
      classId,
      sessionTermId: activeTerm.id
    },
    include: {
      student: true
    },
    orderBy: {
      student: { name: "asc" }
    }
  });

  return (
    <div className="container py-8 min-h-[calc(100vh-4rem)] space-y-8 animate-fade-in">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent w-fit">
          Print Report Cards
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate and print official report cards for students in {classes[0].name}.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/form-master/report-cards/${enrollment.studentId}`}
              className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-teal-500/10 hover:border-teal-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{enrollment.student.name || enrollment.student.email}</p>
                </div>
              </div>
              <Printer className="w-4 h-4 text-muted-foreground group-hover:text-teal-400 transition-colors" />
            </Link>
          ))}
        </div>

        {enrollments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No students are currently enrolled in this class for the active term.
          </div>
        )}
      </div>
    </div>
  );
}
