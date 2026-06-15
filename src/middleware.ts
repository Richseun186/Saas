import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/", "/login"];
const authRoutes = ["/login"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Allow API routes
  if (nextUrl.pathname.startsWith("/api")) {
    return;
  }

  // Handle auth routes (e.g. redirect to dashboard if logged in)
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Basic redirect based on role
      if (userRole === "ADMIN") return Response.redirect(new URL("/admin", nextUrl));
      if (userRole === "FORM_MASTER") return Response.redirect(new URL("/form-master", nextUrl));
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
    if (nextUrl.pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return Response.redirect(new URL(`/${userRole?.toLowerCase().replace("_", "-") || ""}`, nextUrl));
    }
    if (nextUrl.pathname.startsWith("/form-master") && userRole !== "FORM_MASTER" && userRole !== "ADMIN") {
      return Response.redirect(new URL("/student", nextUrl));
    }
  }

  return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
