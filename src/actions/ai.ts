"use server";

import { db } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateClassRemarks(classId: string, termId: string) {
  try {
    // 1. Fetch all enrollments for this class and term
    const enrollments = await db.enrollment.findMany({
      where: { classId, sessionTermId: termId },
      include: {
        student: { select: { name: true, email: true } },
        results: {
          include: { schoolSubject: { include: { subjectBank: true } } }
        }
      }
    });

    if (enrollments.length === 0) return { success: false, error: "No students found in this class." };

    // 2. Prepare the prompt for each student
    // For efficiency, we will loop through and call the AI. In a production system, you'd batch this or run it in background.
    for (const enrollment of enrollments) {
      const studentName = enrollment.student.name || "The student";
      
      let totalScore = 0;
      let subjectsSummary = "";

      enrollment.results.forEach(r => {
        totalScore += r.total || 0;
        subjectsSummary += `- ${r.schoolSubject.subjectBank.name}: Total ${r.total || 0}, Grade ${r.grade || "-"}\n`;
      });

      const average = enrollment.results.length > 0 ? (totalScore / (enrollment.results.length * 100)) * 100 : 0;

      const prompt = `
You are an expert Nigerian school educator writing end-of-term report card remarks.
Student Name: ${studentName}
Overall Average: ${average.toFixed(1)}%
Subjects and Grades:
${subjectsSummary}

Please provide TWO short, distinct remarks (max 2 sentences each):
1. A 'Form Master Remark' (from the perspective of the class teacher, focusing on daily academic effort and specific strengths/weaknesses).
2. A 'Principal Remark' (from the perspective of the head of school, focusing on overall character, discipline, and high-level academic standing).

Respond strictly in the following JSON format:
{
  "formMasterRemark": "...",
  "principalRemark": "..."
}
      `;

      // 3. Call Gemini
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const text = response.text;
      if (text) {
        try {
          const parsed = JSON.parse(text);
          
          // 4. Save to database
          await db.enrollment.update({
            where: { id: enrollment.id },
            data: {
              formMasterRemark: parsed.formMasterRemark,
              principalRemark: parsed.principalRemark,
            }
          });
        } catch (e) {
          console.error("Failed to parse AI JSON for student", studentName, e);
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return { success: false, error: error.message };
  }
}
