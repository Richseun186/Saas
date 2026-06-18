"use client";

import { useFormStatus } from "react-dom";
import { loginAction } from "@/actions/auth";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg py-2.5 px-4 hover:opacity-90 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all duration-300 disabled:opacity-50"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

function LoginForm() {
  const [error, setError] = useState<string | undefined>("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const action = async (formData: FormData) => {
    formData.append("callbackUrl", callbackUrl);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Full-screen background image with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 hover:scale-105"
        style={{ backgroundImage: "url('/education_hero_dark.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-background/80 backdrop-blur-sm" />

      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] z-0" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="glass-card rounded-2xl p-8 hover-lift shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent text-glow">
              GradeSync
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Empowering Nigerian Schools
            </p>
          </div>

          <form action={action} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none text-foreground/90"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="flex h-11 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-background/90"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none text-foreground/90"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="flex h-11 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-background/90"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20 text-sm font-medium text-destructive-foreground">
                {error}
              </div>
            )}

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
