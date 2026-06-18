"use client";

import { useState, useEffect } from "react";
import Broadsheet from "@/components/shared/Broadsheet";
import { getBroadsheetData, saveScores } from "@/actions/grading";
import { generateClassRemarks } from "@/actions/ai";
import { Sparkles } from "lucide-react";

interface FormMasterWorkspaceProps {
  classes: { id: string; name: string }[];
  subjects: { id: string; subjectBank: { name: string } }[];
  termId: string;
}

export default function FormMasterWorkspace({ classes, subjects, termId }: FormMasterWorkspaceProps) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "");
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId || !termId) return;
    
    async function fetchData() {
      setIsLoading(true);
      const data = await getBroadsheetData(selectedClassId, termId, selectedSubjectId);
      setStudentsData(data);
      setIsLoading(false);
    }
    fetchData();
  }, [selectedClassId, selectedSubjectId, termId]);

  const handleSave = async (scores: any[]) => {
    setIsSaving(true);
    const result = await saveScores(selectedSubjectId, scores);
    setIsSaving(false);
    if (result.success) {
      alert("Scores saved successfully!");
    } else {
      alert("Error saving scores: " + result.error);
    }
  };

  const handleGenerateRemarks = async () => {
    if (!confirm("This will read all student scores and generate AI remarks. It may take a minute. Proceed?")) return;
    
    setIsGenerating(true);
    const result = await generateClassRemarks(selectedClassId, termId);
    setIsGenerating(false);
    
    if (result.success) {
      alert("AI Remarks generated successfully! Students can now view them on their report cards.");
    } else {
      alert("Error generating remarks: " + result.error);
    }
  };

  const subjectName = subjects.find(s => s.id === selectedSubjectId)?.subjectBank.name || "Subject";
  
  // Format data for Broadsheet
  const mappedStudents = studentsData.map(s => ({
    id: s.enrollmentId,
    name: s.studentName,
    admissionNo: "GSN-" + s.studentId.substring(0, 4).toUpperCase(), // Fake admission number for demo
  }));
  
  const initialScores = studentsData.map(s => ({
    enrollmentId: s.enrollmentId,
    ca1: s.ca1,
    ca2: s.ca2,
    exam: s.exam
  }));

  if (classes.length === 0) {
    return <div className="p-8 text-center text-muted-foreground border rounded-xl bg-slate-50">You are not assigned as a Form Master for any class.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 p-5 glass-card rounded-2xl hover-lift animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-foreground/80">Class</label>
          <select 
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-white/10 bg-background/50 focus:bg-background/80 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id} className="bg-background">{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-foreground/80">Subject</label>
          <select 
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-white/10 bg-background/50 focus:bg-background/80 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id} className="bg-background">{s.subjectBank.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground glass-card rounded-2xl animate-pulse">
          Loading students...
        </div>
      ) : (
        <>
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Broadsheet 
              subjectName={subjectName}
              students={mappedStudents}
              initialScores={initialScores}
              onSave={handleSave}
              isSaving={isSaving}
            />
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-4 animate-slide-up hover-lift" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 p-4 rounded-xl text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">Finalize & Publish Results</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Once all subjects have been entered, use AI to automatically read every student's grades and write personalized Form Master and Principal remarks.
                </p>
              </div>
              <button
                onClick={handleGenerateRemarks}
                disabled={isGenerating}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 text-white px-6 py-3 rounded-xl font-semibold shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50 transition-all duration-300"
              >
                {isGenerating ? "Generating..." : "Generate AI Remarks"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
