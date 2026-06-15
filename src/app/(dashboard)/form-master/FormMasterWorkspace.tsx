"use client";

import { useState, useEffect } from "react";
import Broadsheet from "@/components/shared/Broadsheet";
import { getBroadsheetData, saveScores } from "@/actions/grading";

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
      <div className="flex gap-4 p-4 border rounded-xl bg-slate-50 dark:bg-slate-900/50">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Class</label>
          <select 
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full p-2 rounded-md border bg-white dark:bg-slate-950"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Subject</label>
          <select 
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full p-2 rounded-md border bg-white dark:bg-slate-950"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.subjectBank.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground border rounded-xl bg-white animate-pulse">
          Loading students...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-xl border p-4">
          <Broadsheet 
            subjectName={subjectName}
            students={mappedStudents}
            initialScores={initialScores}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      )}
    </div>
  );
}
