"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowLeft, ArrowRight, CreditCard, CheckCircle2, Lock, Loader2, Eye, EyeOff, Wifi } from "lucide-react";
import { registerSchool } from "@/actions/onboarding";

const PLANS: Record<string, { name: string; price: string; amount: number }> = {
  basic:    { name: "Basic Plan",    price: "₦25,000/term", amount: 25000 },
  standard: { name: "Standard Plan", price: "₦50,000/term", amount: 50000 },
  premium:  { name: "Premium Plan",  price: "₦100,000/term", amount: 100000 },
};

type Step = "school" | "admin" | "payment" | "success";

// Inner component that actually uses useSearchParams
function RegisterInner() {
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan") ?? "standard";
  const plan = PLANS[planKey] || PLANS.standard;

  const [step, setStep] = useState<Step>("school");
  const [isPending, startTransition] = useTransition();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Payment state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardName, setCardName] = useState("");
  const [paymentPhase, setPaymentPhase] = useState<"form" | "processing" | "otp">("form");
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);

  const steps: { key: Step; label: string }[] = [
    { key: "school",  label: "School Info" },
    { key: "admin",   label: "Admin Account" },
    { key: "payment", label: "Payment" },
  ];
  const stepIndex = steps.findIndex(s => s.key === step);

  const handleCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits.replace(/(\d{4})(?=\d)/g, "$1 "));
  };
  const handleExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) setCardExpiry(digits.slice(0, 2) + "/" + digits.slice(2));
    else setCardExpiry(digits);
  };
  const handleOtpInput = (index: number, val: string) => {
    if (val.length > 1) return;
    const updated = [...otpInputs];
    updated[index] = val;
    setOtpInputs(updated);
    if (val && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleSchoolNext = () => {
    if (!schoolName.trim() || !address.trim()) { setError("Please fill in all fields."); return; }
    setError(""); setStep("admin");
  };
  const handleAdminNext = () => {
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) { setError("Please fill in all fields."); return; }
    if (adminPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setStep("payment");
  };
  const handlePayNow = () => {
    if (!cardNumber || !cardExpiry || !cardCVV || !cardName) { setError("Please complete all card details."); return; }
    setError("");
    setPaymentPhase("processing");
    setTimeout(() => setPaymentPhase("otp"), 2500);
  };
  const handleOtpSubmit = () => {
    const otpFull = otpInputs.join("");
    if (otpFull.length < 6) { setError("Please enter the 6-digit OTP."); return; }
    setError("");
    startTransition(async () => {
      const result = await registerSchool({ schoolName, address, adminName, adminEmail, adminPassword, plan: planKey });
      if (result.success) setStep("success");
      else { setError(result.error || "Registration failed. Please try again."); setPaymentPhase("form"); }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container max-w-5xl mx-auto h-16 flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">GradeSync <span className="text-teal-400">Nigeria</span></span>
          </Link>
          <span className="text-sm text-slate-400">Already have an account? <Link href="/login" className="text-teal-400 hover:underline">Sign in</Link></span>
        </div>
      </header>

      <div className="flex-grow flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Progress Steps */}
          {step !== "success" && (
            <div className="flex items-center justify-between mb-10">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-3 flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < stepIndex ? "bg-teal-500 text-white" : i === stepIndex ? "bg-teal-500 text-white ring-4 ring-teal-500/20" : "bg-white/5 text-slate-400 border border-white/10"}`}>
                    {i < stepIndex ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-semibold ${i <= stepIndex ? "text-white" : "text-slate-500"}`}>{s.label}</p>
                  </div>
                  {i < 2 && <div className={`flex-1 h-px mx-4 ${i < stepIndex ? "bg-teal-500" : "bg-white/10"}`} />}
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 1: School Info ── */}
          {step === "school" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Tell us about your school</h1>
                <p className="text-slate-400 text-sm">This information will appear on your report cards and invoices.</p>
              </div>
              {error && <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">School Name</label>
                  <input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. Lagos Sunrise Academy" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">School Address</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="e.g. 12 Awolowo Rd, Ikoyi, Lagos" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-slate-400 text-sm">Selected Plan</span>
                <span className="text-white font-bold">{plan.name} — {plan.price}</span>
              </div>
              <button onClick={handleSchoolNext} className="w-full py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-400 transition flex items-center justify-center gap-2 group">
                Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Admin Account ── */}
          {step === "admin" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <button onClick={() => setStep("school")} className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="text-2xl font-bold text-white mb-1">Create your Admin account</h1>
                <p className="text-slate-400 text-sm">This will be your primary login to manage the school platform.</p>
              </div>
              {error && <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="e.g. Mrs. Adesola Bello" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@yourschool.edu.ng" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Min. 8 characters" className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={handleAdminNext} className="w-full py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-400 transition flex items-center justify-center gap-2 group">
                Continue to Payment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === "payment" && (
            <div className="animate-fade-in">
              <button onClick={() => { setStep("admin"); setPaymentPhase("form"); }} className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm mb-6">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {paymentPhase === "form" && (
                <div className="space-y-6">
                  {/* Paystack-style header bar */}
                  <div className="p-5 rounded-2xl bg-[#011B33] border border-[#023E63]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">GradeSync Nigeria</p>
                          <p className="text-slate-400 text-xs">{adminEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-xl">₦{plan.amount.toLocaleString()}</p>
                        <p className="text-slate-400 text-xs">{plan.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {["CARD", "BANK", "USSD"].map((tab, i) => (
                        <button key={tab} className={`px-3 py-1.5 rounded text-xs font-semibold transition ${i === 0 ? "bg-teal-500 text-white" : "text-slate-400 hover:text-white"}`}>{tab}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {error && <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Card Number</label>
                      <div className="relative">
                        <input value={cardNumber} onChange={e => handleCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" maxLength={19} className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono tracking-wider transition" />
                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Name on Card</label>
                      <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="e.g. ADESOLA BELLO" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                        <input value={cardExpiry} onChange={e => handleExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">CVV</label>
                        <input value={cardCVV} onChange={e => setCardCVV(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="•••" maxLength={3} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono transition" />
                      </div>
                    </div>
                  </div>

                  <button onClick={handlePayNow} className="w-full py-4 rounded-xl bg-teal-500 text-white font-bold text-lg hover:bg-teal-400 transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20">
                    <Lock className="w-4 h-4" /> Pay ₦{plan.amount.toLocaleString()}
                  </button>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Lock className="w-3 h-3" /> Secured by <span className="text-teal-400 font-semibold">Paystack</span>
                  </div>
                </div>
              )}

              {paymentPhase === "processing" && (
                <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-teal-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 animate-spin" />
                    <Wifi className="absolute inset-0 m-auto w-8 h-8 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Processing Payment</p>
                    <p className="text-slate-400 text-sm mt-1">Please wait. Do not close this tab.</p>
                  </div>
                  <p className="text-xs text-slate-500">Connecting to your bank...</p>
                </div>
              )}

              {paymentPhase === "otp" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-7 h-7 text-teal-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">OTP Verification</h2>
                    <p className="text-slate-400 text-sm">We sent a one-time password to the phone number linked to your card. Enter any 6 digits to confirm.</p>
                  </div>
                  {error && <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}
                  <div className="flex gap-3 justify-center">
                    {otpInputs.map((val, i) => (
                      <input key={i} id={`otp-${i}`} value={val} onChange={e => handleOtpInput(i, e.target.value)} maxLength={1} className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                    ))}
                  </div>
                  <button onClick={handleOtpSubmit} disabled={isPending} className="w-full py-4 rounded-xl bg-teal-500 text-white font-bold text-lg hover:bg-teal-400 transition flex items-center justify-center gap-2 disabled:opacity-60">
                    {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Activating Account...</> : "Verify & Activate School"}
                  </button>
                  <p className="text-center text-xs text-slate-500">Didn&apos;t receive OTP? <button className="text-teal-400 hover:underline">Resend OTP</button></p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center py-8 gap-6 animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-teal-500/10 border-2 border-teal-500 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-teal-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-3">🎉 Welcome to GradeSync!</h1>
                <p className="text-slate-300 mb-1">Your school <span className="text-white font-semibold">{schoolName}</span> is now active.</p>
                <p className="text-slate-400 text-sm">Log in with <span className="text-teal-400">{adminEmail}</span> to start setting up your school.</p>
              </div>
              <div className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-left space-y-3">
                <p className="text-white font-semibold text-sm mb-1">Your Next Steps:</p>
                {["Create classes and add subject teachers", "Enrol your students", "Allocate subjects per class", "Start recording scores and running CBT exams"].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    {s}
                  </div>
                ))}
              </div>
              <Link href="/login" className="w-full py-4 rounded-xl bg-teal-500 text-white font-bold text-lg hover:bg-teal-400 transition">
                Go to Admin Dashboard →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export with Suspense so useSearchParams() is satisfied during static generation
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    }>
      <RegisterInner />
    </Suspense>
  );
}
