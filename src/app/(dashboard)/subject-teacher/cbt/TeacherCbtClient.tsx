"use client";

import { useState } from "react";
import { createCbtExam, addCbtQuestion } from "@/actions/cbt";
import { PlusCircle, BookOpen, ChevronDown, ChevronUp, CheckCircle2, Users, Trash2 } from "lucide-react";

interface Props {
  teacherId: string;
  allocations: any[];
  activeTerm: { id: string; name: string } | null;
  initialExams: any[];
}

export default function TeacherCbtClient({ teacherId, allocations, activeTerm, initialExams }: Props) {
  const [exams, setExams] = useState(initialExams);
  const [activePanel, setActivePanel] = useState<"list" | "create">("list");
  const [expandedExam, setExpandedExam] = useState<string | null>(null);

  // Exam creation state
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [selectedAlloc, setSelectedAlloc] = useState(allocations[0]?.id || "");
  const [isCreating, setIsCreating] = useState(false);
  const [newExamId, setNewExamId] = useState<string | null>(null);

  // Question state
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  const [marks, setMarks] = useState(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isAddingQ, setIsAddingQ] = useState(false);

  const selectedAllocation = allocations.find(a => a.id === selectedAlloc);

  const handleCreateExam = async () => {
    if (!title || !selectedAllocation || !activeTerm) return;
    setIsCreating(true);
    const res = await createCbtExam({
      title,
      durationMinutes: duration,
      classId: selectedAllocation.classId,
      schoolSubjectId: selectedAllocation.schoolSubjectId,
      sessionTermId: activeTerm.id,
    });
    setIsCreating(false);
    if (res.success && res.exam) {
      setNewExamId(res.exam.id);
      setActivePanel("list");
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleAddQuestion = async () => {
    if (!newExamId || !questionText || !optionA || !optionB || !optionC || !optionD) {
      return alert("Please fill in all question fields.");
    }
    setIsAddingQ(true);
    const res = await addCbtQuestion(newExamId, {
      questionText, optionA, optionB, optionC, optionD, correctOption, marks
    });
    setIsAddingQ(false);
    if (res.success) {
      setQuestions(prev => [...prev, { questionText, correctOption, marks }]);
      setQuestionText(""); setOptionA(""); setOptionB(""); setOptionC(""); setOptionD("");
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent w-fit">
            CBT Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage Computer Based Tests for your classes.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setActivePanel("list"); setNewExamId(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activePanel === "list" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5"}`}>
            My Exams
          </button>
          <button onClick={() => setActivePanel("create")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${activePanel === "create" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
            <PlusCircle className="w-4 h-4" /> New Exam
          </button>
        </div>
      </div>

      {/* Create Exam Panel */}
      {activePanel === "create" && !newExamId && (
        <div className="glass-card p-6 rounded-2xl max-w-2xl space-y-4 animate-slide-up">
          <h2 className="font-bold text-xl flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-400" /> Create New Exam</h2>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Exam Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., First Term Mid-Term Test" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Class & Subject</label>
            <select value={selectedAlloc} onChange={e => setSelectedAlloc(e.target.value)} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors">
              {allocations.map(a => <option key={a.id} value={a.id} className="bg-background">{a.class.name} — {a.schoolSubject.subjectBank.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Duration (minutes)</label>
            <input type="number" min={5} max={180} value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" />
          </div>
          <button onClick={handleCreateExam} disabled={isCreating || !title || !selectedAlloc} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all">
            {isCreating ? "Creating..." : "Create Exam & Add Questions"}
          </button>
        </div>
      )}

      {/* Add Questions Panel */}
      {newExamId && (
        <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
          <div className="glass-card p-6 rounded-2xl space-y-4 border border-blue-500/20">
            <h2 className="font-bold text-lg text-blue-300">Add Questions to: <span className="text-foreground">{title}</span></h2>
            <div className="space-y-3">
              <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Question text..." rows={3} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors resize-none" />
              {[["A", optionA, setOptionA], ["B", optionB, setOptionB], ["C", optionC, setOptionC], ["D", optionD, setOptionD]].map(([letter, value, setter]: any) => (
                <div key={letter} className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${correctOption === letter ? "bg-blue-500 text-white" : "bg-white/10 text-muted-foreground"}`}>{letter}</span>
                  <input value={value} onChange={e => setter(e.target.value)} placeholder={`Option ${letter}`} className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
                </div>
              ))}
              <div className="flex gap-3 items-center">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground">Correct Answer</label>
                  <select value={correctOption} onChange={e => setCorrectOption(e.target.value)} className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                    {["A","B","C","D"].map(l => <option key={l} value={l} className="bg-background">Option {l}</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground">Marks</label>
                  <input type="number" min={1} value={marks} onChange={e => setMarks(Number(e.target.value))} className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={handleAddQuestion} disabled={isAddingQ} className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                {isAddingQ ? "Adding..." : "Add Question"}
              </button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h2 className="font-bold text-lg">{questions.length} Questions Added</h2>
            {questions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No questions yet. Add your first question on the left.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-xs font-bold text-muted-foreground mt-0.5 w-5 flex-shrink-0">Q{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{q.questionText}</p>
                      <p className="text-xs text-teal-400 mt-0.5">Correct: Option {q.correctOption} • {q.marks} mark(s)</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            )}
            {questions.length > 0 && (
              <button onClick={() => { setNewExamId(null); setQuestions([]); setActivePanel("list"); }} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-all mt-4">
                Done — View All Exams
              </button>
            )}
          </div>
        </div>
      )}

      {/* Exams List */}
      {activePanel === "list" && (
        <div className="space-y-4">
          {exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl gap-3">
              <BookOpen className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">No exams created yet. Click &quot;New Exam&quot; to get started.</p>
            </div>
          ) : (
            exams.map(exam => (
              <div key={exam.id} className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                <button onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">{exam.class.name} · {exam.schoolSubject.subjectBank.name} · {exam.durationMinutes} mins</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-blue-400">{exam._count.questions} Questions</p>
                      <p className="text-xs text-muted-foreground">{exam._count.attempts} Attempts</p>
                    </div>
                    {expandedExam === exam.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {expandedExam === exam.id && (
                  <div className="border-t border-white/10 p-5 bg-black/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{exam._count.attempts} students have attempted this exam.</span>
                    </div>
                    <button onClick={() => { setNewExamId(exam.id); setTitle(exam.title); setActivePanel("create"); }} className="text-sm text-blue-400 hover:underline">
                      + Add more questions
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
