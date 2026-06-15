import { auth } from "@/auth";
import { getStudentReportCard } from "@/actions/student";
import ReportCard from "@/components/shared/ReportCard";
import { redirect } from "next/navigation";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const reportCardData = await getStudentReportCard(session.user.id);

  return (
    <div className="container py-8 animate-fade-in space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Student Portal</h1>
        <p className="text-muted-foreground">
          View your academic performance and download your report card.
        </p>
      </div>

      {!reportCardData ? (
        <div className="p-8 text-center text-muted-foreground bg-white rounded-xl border">
          No report card data available for the current term. Please check back later.
        </div>
      ) : (
        <div className="py-4">
          <ReportCard {...reportCardData} />
        </div>
      )}
    </div>
  );
}
