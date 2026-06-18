import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getActiveTerm } from "@/actions/grading";
import { startCbtAttempt, getExamForAttempt } from "@/actions/cbt";
import { db } from "@/lib/db";
import ExamInterface from "./ExamInterface";

export default async function TakeExamPage({ params }: { params: { examId: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exam = await getExamForAttempt(params.examId);
  if (!exam) redirect("/student/cbt");

  if (exam.questions.length === 0) {
    return (
      <div className="container py-10 text-center">
        <p className="text-muted-foreground py-20 border border-dashed border-white/10 rounded-2xl">
          This exam has no questions yet. Please try again later.
        </p>
      </div>
    );
  }

  // Get student enrollment
  const enrollment = await db.enrollment.findFirst({
    where: { studentId: session.user.id },
    include: { sessionTerm: { select: { schoolId: true } } }
  });
  if (!enrollment) redirect("/student");

  const term = await getActiveTerm(enrollment.sessionTerm.schoolId);
  if (!term) redirect("/student");

  // Start or resume attempt
  const attemptRes = await startCbtAttempt(params.examId, session.user.id, term.id);
  if (!attemptRes.success) {
    return (
      <div className="container py-10 text-center">
        <p className="text-rose-400 py-20 border border-dashed border-rose-500/20 rounded-2xl font-medium">
          {attemptRes.error}
        </p>
        <a href="/student/cbt" className="mt-4 inline-block text-blue-400 underline">Back to Exams</a>
      </div>
    );
  }

  return <ExamInterface exam={exam as any} attemptId={attemptRes.attemptId!} />;
}
