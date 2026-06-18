"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { submitCbtExam } from "@/actions/cbt";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: number;
}

interface Props {
  exam: {
    id: string;
    title: string;
    durationMinutes: number;
    totalMarks: number;
    schoolSubject: { subjectBank: { name: string } };
    questions: Question[];
  };
  attemptId: string;
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"] as const;

export default function ExamInterface({ exam, attemptId }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const hasAutoSubmitted = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;
    setIsSubmitting(true);
    const res = await submitCbtExam(attemptId, answers);
    setIsSubmitting(false);
    if (res.success && res.score !== undefined) {
      setResult({ score: res.score, total: res.total! });
    }
  }, [attemptId, answers, isSubmitting]);

  // Countdown timer
  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [result, handleSubmit]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;
  const currentQ = exam.questions[currentIndex];
  const isLowTime = timeLeft < 120; // < 2 minutes

  // Results Screen
  if (result) {
    const percentage = (result.score / result.total) * 100;
    const passed = percentage >= 50;
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full rounded-3xl p-10 text-center space-y-6 animate-slide-up border border-white/10">
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${passed ? "bg-teal-500/20 border-2 border-teal-500/50" : "bg-rose-500/20 border-2 border-rose-500/50"}`}>
            <CheckCircle2 className={`w-12 h-12 ${passed ? "text-teal-400" : "text-rose-400"}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Exam Submitted!</h1>
            <p className="text-muted-foreground mt-2">{exam.title}</p>
          </div>
          <div className="bg-white/[0.03] rounded-2xl p-6 space-y-2">
            <p className="text-sm text-muted-foreground">Your Score</p>
            <p className={`text-6xl font-black ${passed ? "text-teal-400" : "text-rose-400"}`}>
              {result.score}<span className="text-2xl text-muted-foreground font-normal">/{result.total}</span>
            </p>
            <p className={`text-lg font-semibold ${passed ? "text-teal-400" : "text-rose-400"}`}>
              {percentage.toFixed(1)}% — {passed ? "PASSED 🎉" : "FAILED"}
            </p>
          </div>
          <a href="/student/cbt" className="block w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
            Back to Exams
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-bold text-base truncate">{exam.title}</h1>
            <p className="text-xs text-muted-foreground">{exam.schoolSubject.subjectBank.name} • Q{currentIndex + 1}/{totalQuestions}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold border transition-colors flex-shrink-0 ${isLowTime ? "bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse" : "bg-white/[0.05] border-white/10 text-foreground"}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="max-w-5xl mx-auto mt-2">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{answeredCount}/{totalQuestions} answered</p>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 grid md:grid-cols-[1fr_220px] gap-6 items-start">
        {/* Question */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/10">
            <div className="flex items-start gap-3 mb-6">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                {currentIndex + 1}
              </span>
              <p className="text-lg font-medium leading-relaxed">{currentQ.questionText}</p>
            </div>

            <div className="space-y-3">
              {OPTION_LABELS.map((label, i) => {
                const optionText = currentQ[OPTION_KEYS[i]];
                const isSelected = answers[currentQ.id] === label;
                return (
                  <button
                    key={label}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: label }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-blue-500/20 border-blue-500/60 text-foreground shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                    }`}
                  >
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold transition-colors ${isSelected ? "bg-blue-500 border-blue-400 text-white" : "border-white/20 text-muted-foreground"}`}>
                      {label}
                    </span>
                    <span className={isSelected ? "text-foreground" : "text-muted-foreground"}>{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3">
            <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0} className="px-5 py-2.5 rounded-xl border border-white/10 font-medium text-sm hover:bg-white/10 disabled:opacity-40 transition-colors">
              ← Previous
            </button>
            {currentIndex < totalQuestions - 1 ? (
              <button onClick={() => setCurrentIndex(i => Math.min(totalQuestions - 1, i + 1))} className="px-5 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-medium text-sm hover:bg-blue-500/30 transition-colors">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </button>
            )}
          </div>

          {/* Low time warning */}
          {isLowTime && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Less than 2 minutes remaining! Your exam will be auto-submitted.</p>
            </div>
          )}
        </div>

        {/* ── Question Grid Navigator ── */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 sticky top-28">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Questions</p>
          <div className="grid grid-cols-5 gap-2">
            {exam.questions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`aspect-square rounded-lg text-xs font-bold transition-all ${
                    isCurrent ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]" :
                    isAnswered ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" :
                    "bg-white/[0.05] text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-teal-500/20 border border-teal-500/30 inline-block"/><span>Answered</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"/><span>Current</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-white/10 inline-block"/><span>Unanswered</span></div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "Submitting..." : "Submit Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
