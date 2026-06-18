import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStudentReportCard } from "@/actions/student";
import ReportCard from "@/components/shared/ReportCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";

export default async function ParentPrintReportCardPage({
  params
}: {
  params: { studentId: string }
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Basic security check: ensure the parent is requesting their own child
  const parentStudentRef = await db.parentStudentLink.findFirst({
    where: {
      parentId: session.user.id,
      studentId: params.studentId
    }
  });

  if (!parentStudentRef) {
    return (
      <div className="container py-8 text-center text-muted-foreground">
        Unauthorized access. You are not linked to this student.
      </div>
    );
  }

  const reportCardData = await getStudentReportCard(params.studentId);

  if (!reportCardData) {
    return (
      <div className="container py-8 text-center text-muted-foreground">
        Report card data could not be generated for this student. Ensure they have active enrollments and results.
        <br />
        <Link href="/parent" className="text-blue-400 hover:underline mt-4 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="container pt-8 pb-4 print:hidden flex items-center justify-between">
        <Link href="/parent" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
      
      <div className="container py-4">
        <ReportCard {...reportCardData} />
      </div>
    </div>
  );
}
