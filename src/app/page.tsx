"use client";

import Link from "next/link";
import { GraduationCap, BookOpen, BarChart3, Shield, Sparkles, Award, Users, CheckCircle2, ChevronRight, Activity, Brain } from "lucide-react";
import { useEffect, useState } from "react";

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
    <div className="min-h-screen flex flex-col bg-background selection:bg-teal-500/30 overflow-x-hidden">
      
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="container max-w-7xl mx-auto h-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">GradeSync <span className="text-teal-400">Nigeria</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/demo" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">Interactive Demo</Link>
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log In</Link>
            <Link href="/register" className="px-5 py-2.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg hover:shadow-white/20">
              Register School
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
        
        {/* ── HERO SECTION ── */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
          {/* Backgrounds */}
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40" style={{ backgroundImage: "url('/landing_hero_dark.png')" }} />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          
          {mounted && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {particles.map((p) => <Particle key={p.id} {...p} />)}
            </div>
          )}

          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/15 rounded-full blur-[80px] animate-float z-0" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-float-delayed z-0" />

          <div className="container relative z-10 text-center max-w-5xl px-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-teal-300 font-medium mb-8 animate-fade-in backdrop-blur-sm">
              <Sparkles className="w-4 h-4" /> Revolutionizing Nigerian Education
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
              <span className="text-white">Run your school </span>
              <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                smarter.
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              The all-in-one platform for broadsheet compilation, cognitive & affective domains, automated report cards, CBT, and fee management.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-lg hover:from-teal-400 hover:to-emerald-400 transition-all shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:shadow-[0_0_60px_rgba(20,184,166,0.5)] flex items-center justify-center gap-2 group">
                Start Free Trial <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/demo" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                View Live Demo
              </Link>
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ── */}
        <section className="py-32 relative border-t border-white/5 bg-black/20">
          <div className="container max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything your school needs in one place</h2>
              <p className="text-lg text-slate-400">Say goodbye to Excel sheets. GradeSync automates every tedious aspect of school administration.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <BarChart3 />, title: "Automated Broadsheets", desc: "Teachers enter CA and Exam scores, and the system automatically compiles continuous assessments and master broadsheets." },
                { icon: <Award />, title: "PDF Report Cards", desc: "Generate flawless end-of-term report cards with just one click. Includes principal remarks, traits, and official crests." },
                { icon: <Brain />, title: "CBT Module", desc: "Built-in Computer Based Testing. Create objective exams, and students can take them securely with automatic grading." },
                { icon: <Activity />, title: "Affective & Psychomotor", desc: "Full tracking of behavioral traits (punctuality, neatness) and physical skills (sports, handwriting) as mandated by the curriculum." },
                { icon: <Users />, title: "Parent Portal", desc: "Give parents a dedicated dashboard to track their child's daily attendance, academic scores, and download official results." },
                { icon: <Shield />, title: "Fee Management", desc: "Generate invoices, log payments, and track outstanding fees across the entire school instantly." },
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING SECTION ── */}
        <section className="py-32 relative">
          <div className="container max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, transparent pricing</h2>
              <p className="text-lg text-slate-400">Choose the perfect plan for your school size. No hidden fees.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Basic */}
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
                <p className="text-slate-400 text-sm mb-6">For small primary schools</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₦25,000</span>
                  <span className="text-slate-400">/term</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {["Up to 200 Students", "Automated Broadsheets", "PDF Report Cards", "Teacher Portals"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register?plan=basic" className="w-full py-3 rounded-xl bg-white/5 text-white font-semibold text-center hover:bg-white/10 transition-colors">Get Started</Link>
              </div>

              {/* Pro */}
              <div className="p-8 rounded-3xl bg-gradient-to-b from-teal-500/20 to-transparent border border-teal-500/30 flex flex-col relative transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-teal-500 text-white text-xs font-bold uppercase tracking-wider">Most Popular</div>
                <h3 className="text-xl font-bold text-white mb-2">Standard</h3>
                <p className="text-slate-400 text-sm mb-6">For growing secondary schools</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₦50,000</span>
                  <span className="text-slate-400">/term</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {["Up to 1,000 Students", "Everything in Basic", "Parent Portals", "Fee Management", "Affective & Psychomotor"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register?plan=standard" className="w-full py-3 rounded-xl bg-teal-500 text-white font-semibold text-center hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20">Get Started</Link>
              </div>

              {/* Enterprise */}
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
                <p className="text-slate-400 text-sm mb-6">For massive institutions</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₦100,000</span>
                  <span className="text-slate-400">/term</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {["Unlimited Students", "Everything in Standard", "Computer Based Testing (CBT)", "Priority Phone Support", "Custom Domain"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register?plan=premium" className="w-full py-3 rounded-xl bg-white/5 text-white font-semibold text-center hover:bg-white/10 transition-colors">Get Started</Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-black/40 py-12">
        <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">GradeSync <span className="text-teal-400">Nigeria</span></span>
          </div>
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} GradeSync Software Solutions. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
