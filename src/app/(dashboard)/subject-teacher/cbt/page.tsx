import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getTeacherExams } from "@/actions/cbt";
import { getActiveTerm } from "@/actions/grading";
import TeacherCbtClient from "./TeacherCbtClient";

export default async function TeacherCbtPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const roles = session.user.roles || [];
  if (!roles.includes("SUBJECT_TEACHER") && !roles.includes("ADMIN")) redirect("/student");

  // Get teacher's subject allocations
  const allocations = await db.subjectAllocation.findMany({
    where: { teacherId: session.user.id },
    include: {
      class: true,
      schoolSubject: { include: { subjectBank: true } },
      sessionTerm: true
    }
  });

  const schoolId = allocations[0]?.class?.schoolId || "";
  const activeTerm = await getActiveTerm(schoolId);
  const initialExams = await getTeacherExams(session.user.id);

  return (
    <div className="container py-8 min-h-[calc(100vh-4rem)]">
      <TeacherCbtClient
        teacherId={session.user.id}
        allocations={allocations}
        activeTerm={activeTerm}
        initialExams={initialExams}
      />
    </div>
  );
}
