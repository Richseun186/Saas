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

  // Determine dashboard link based on role
  let dashboardUrl = "/student";
  if (session.user.role === "ADMIN") dashboardUrl = "/admin";
  if (session.user.role === "FORM_MASTER") dashboardUrl = "/form-master";

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-sm font-medium leading-none">{session.user.name}</span>
        <span className="text-xs text-muted-foreground mt-1">{session.user.role?.replace("_", " ")}</span>
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
