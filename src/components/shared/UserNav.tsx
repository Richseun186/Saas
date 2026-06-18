import { auth, signOut } from "@/auth";
import Link from "next/link";

export default async function UserNav() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Sign in
      </Link>
    );
  }

  // Determine dashboard link based on highest role
  let dashboardUrl = "/student";
  const userRoles = session.user.roles || [];
  if (userRoles.includes("ADMIN")) dashboardUrl = "/admin";
  else if (userRoles.includes("FORM_MASTER")) dashboardUrl = "/form-master";
  else if (userRoles.includes("SUBJECT_TEACHER")) dashboardUrl = "/subject-teacher";
  else if (userRoles.includes("PARENT")) dashboardUrl = "/parent";

  const mainRole = userRoles[0] || "STUDENT";

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-sm font-medium leading-none">{session.user.name}</span>
        <span className="text-xs text-muted-foreground mt-1">{mainRole.replace("_", " ")}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Link 
          href={dashboardUrl}
          className="text-sm font-medium text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-md transition-colors"
        >
          Dashboard
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button 
            type="submit"
            className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
