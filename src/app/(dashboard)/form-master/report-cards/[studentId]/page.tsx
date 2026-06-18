import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStudentReportCard } from "@/actions/student";
import ReportCard from "@/components/shared/ReportCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function FormMasterPrintReportCardPage({
  params
}: {
  params: { studentId: string }
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const reportCardData = await getStudentReportCard(params.studentId);

  if (!reportCardData) {
    return (
      <div className="container py-8 text-center text-muted-foreground">
        Report card data could not be generated for this student. Ensure they have active enrollments and results.
        <br />
        <Link href="/form-master/report-cards" className="text-teal-400 hover:underline mt-4 inline-block">
          &larr; Back to Report Cards
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="container pt-8 pb-4 print:hidden flex items-center justify-between">
        <Link href="/form-master/report-cards" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Class List
        </Link>
      </div>
      
      <div className="container py-4">
        <ReportCard {...reportCardData} />
      </div>
    </div>
  );
}
