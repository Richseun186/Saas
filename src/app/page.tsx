"use client";

import Link from "next/link";
import { GraduationCap, BookOpen, BarChart3, Shield, Sparkles, Award, Users } from "lucide-react";
import { useEffect, useState, useRef } from "react";

// Floating particle component
function Particle({ x, y, size, duration, delay }: { x: number; y: number; size: number; duration: number; delay: number }) {
  return (
    <div
      className="absolute rounded-full bg-teal-400 opacity-0"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animation: `particleFloat ${duration}s ${delay}s ease-in-out infinite`,
        background: Math.random() > 0.5
          ? "radial-gradient(circle, rgba(20,184,166,0.8), transparent)"
          : "radial-gradient(circle, rgba(52,211,153,0.8), transparent)",
        filter: "blur(1px)",
      }}
    />
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    // Generate particles only on the client to avoid SSR hydration mismatch
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 4,
      }))
    );
    setMounted(true);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 overflow-hidden">
      {/* Full-screen background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url('/landing_hero_dark.png')" }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />

      {/* Animated floating particles */}
      {mounted && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <Particle key={p.id} {...p} />
          ))}
        </div>
      )}

      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/15 rounded-full blur-[80px] animate-float z-0" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-float-delayed z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] animate-glow-pulse z-0" />

      {/* Hero Section */}
      <div className="text-center max-w-4xl space-y-8 relative z-10 mt-12">

        {/* Animated Icon */}
        <div
          className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 animate-glow-pulse animate-float"
          style={{ animationDelay: "0s" }}
        >
          <GraduationCap className="h-14 w-14 text-white drop-shadow-lg" />
        </div>

        {/* Title — staggered characters via CSS animation delays */}
        <h1
          className="text-5xl sm:text-7xl font-bold tracking-tight animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
            GradeSync
          </span>{" "}
          <span className="text-white">Nigeria</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-slide-up"
          style={{ animationDelay: "0.25s", opacity: 0 }}
        >
          The all-in-one SaaS platform for Nigerian primary and secondary
          schools to compute student results, generate report cards, and
          track academic performance — powered by AI.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-wrap gap-4 justify-center pt-4 animate-slide-up"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all hover:shadow-[0_0_50px_rgba(20,184,166,0.6)] hover:scale-105 active:scale-95"
          >
            <BarChart3 className="h-5 w-5" />
            View Demo
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-teal-500/40 hover:scale-105 active:scale-95"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full relative z-10 pb-20">
        <FeatureCard
          icon={<BookOpen className="h-8 w-8 text-teal-400" />}
          title="WAEC Standard Grading"
          description="Automatic A1–F9 grade computation following the standard Nigerian WAEC/NECO scale."
          delay="0.5s"
          glowColor="rgba(20,184,166,0.15)"
        />
        <FeatureCard
          icon={<BarChart3 className="h-8 w-8 text-emerald-400" />}
          title="Smart Broadsheets"
          description="Real-time score entry with auto-computed totals, grades, and class positions."
          delay="0.65s"
          glowColor="rgba(52,211,153,0.15)"
        />
        <FeatureCard
          icon={<Sparkles className="h-8 w-8 text-amber-400" />}
          title="AI-Powered Remarks"
          description="Google Gemini automatically writes personalized Form Master and Principal remarks for every student."
          delay="0.8s"
          glowColor="rgba(251,191,36,0.15)"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
  glowColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
  glowColor: string;
}) {
  return (
    <div
      className="glass-card rounded-2xl p-8 hover-lift animate-slide-up group cursor-default"
      style={{
        animationDelay: delay,
        opacity: 0,
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${glowColor}, 0 8px 32px rgba(0,0,0,0.4)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "";
      }}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 group-hover:border-teal-500/30 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.2)]">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-3 text-white group-hover:text-teal-300 transition-colors duration-300">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">{description}</p>
    </div>
  );
}
