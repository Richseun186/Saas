import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getParentLinkedStudents, getStudentFullProfile } from "@/actions/parent";
import ParentDashboardClient from "./ParentDashboardClient";

export default async function ParentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const roles = session.user.roles || [];
  if (!roles.includes("PARENT") && !roles.includes("ADMIN")) redirect("/student");

  const childrenData = await getParentLinkedStudents();

  // Fetch full profiles for all linked children
  const profilesData: Record<string, any> = {};
  for (const child of childrenData) {
    const profile = await getStudentFullProfile(child.id);
    if (profile) {
      profilesData[child.id] = profile;
    }
  }

  return (
    <div className="container py-8 min-h-[calc(100vh-4rem)]">
      <ParentDashboardClient childrenData={childrenData} profilesData={profilesData} />
    </div>
  );
}
