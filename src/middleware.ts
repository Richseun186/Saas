import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/", "/login", "/register", "/demo"];
const authRoutes = ["/login"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRoles = req.auth?.user?.roles || [];

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Allow API routes
  if (nextUrl.pathname.startsWith("/api")) {
    return;
  }

  // Handle auth routes (e.g. redirect to dashboard if logged in)
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Basic redirect based on highest role
      if (userRoles.includes("ADMIN")) return Response.redirect(new URL("/admin", nextUrl));
      if (userRoles.includes("FORM_MASTER")) return Response.redirect(new URL("/form-master", nextUrl));
      if (userRoles.includes("SUBJECT_TEACHER")) return Response.redirect(new URL("/subject-teacher", nextUrl));
      if (userRoles.includes("PARENT")) return Response.redirect(new URL("/parent", nextUrl));
      return Response.redirect(new URL("/student", nextUrl));
    }
    return;
  }

  // Unauthenticated users trying to access private routes
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  // Role-based protection for dashboards
  if (isLoggedIn) {
    if (nextUrl.pathname.startsWith("/admin") && !userRoles.includes("ADMIN")) {
      const highestRole = userRoles[0] || "STUDENT";
      return Response.redirect(new URL(`/${highestRole.toLowerCase().replace("_", "-")}`, nextUrl));
    }
    if (nextUrl.pathname.startsWith("/form-master") && !userRoles.includes("FORM_MASTER") && !userRoles.includes("ADMIN")) {
      const highestRole = userRoles[0] || "STUDENT";
      return Response.redirect(new URL(`/${highestRole.toLowerCase().replace("_", "-")}`, nextUrl));
    }
    if (nextUrl.pathname.startsWith("/subject-teacher") && !userRoles.includes("SUBJECT_TEACHER") && !userRoles.includes("ADMIN")) {
      const highestRole = userRoles[0] || "STUDENT";
      return Response.redirect(new URL(`/${highestRole.toLowerCase().replace("_", "-")}`, nextUrl));
    }
    if (nextUrl.pathname.startsWith("/parent") && !userRoles.includes("PARENT") && !userRoles.includes("ADMIN")) {
      const highestRole = userRoles[0] || "STUDENT";
      return Response.redirect(new URL(`/${highestRole.toLowerCase().replace("_", "-")}`, nextUrl));
    }
  }

  return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
