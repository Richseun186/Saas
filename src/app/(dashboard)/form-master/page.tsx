import { auth } from "@/auth";
import { getFormMasterClasses, getActiveTerm, getSchoolSubjects } from "@/actions/grading";
import FormMasterWorkspace from "./FormMasterWorkspace";
import { redirect } from "next/navigation";

export default async function FormMasterDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // We need to fetch the form master's classes, the active term, and available subjects
  const classes = await getFormMasterClasses(session.user.id);
  const term = await getActiveTerm(classes[0]?.schoolId || "");
  const subjects = await getSchoolSubjects(classes[0]?.schoolId || "");

  return (
    <div className="container py-8 animate-fade-in space-y-8">
      <div className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Form Master Dashboard</h1>
        <p className="text-muted-foreground">
          Select your class and subject to enter continuous assessment and exam scores.
        </p>
      </div>

      {!term ? (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-100">
          No active term found. Please contact the Administrator to start a new academic term.
        </div>
      ) : (
        <FormMasterWorkspace 
          classes={classes} 
          subjects={subjects} 
          termId={term.id} 
        />
      )}
    </div>
  );
}
