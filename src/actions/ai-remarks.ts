"use server";

import { GoogleGenAI } from "@google/genai";

export async function generateRemarks({
  studentName,
  className,
  averagePercentage,
  totalScore,
  subjectGrades,
}: {
  studentName: string;
  className: string;
  averagePercentage: number;
  totalScore: number;
  subjectGrades: Array<{ subject: string; grade: string; ca1: number; ca2: number; exam: number }>;
}) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an AI assistant for a Nigerian secondary school grading system. 
Generate a JSON object containing a "formMasterRemark" and a "principalRemark" for a student based on their end-of-term results.

Student Details:
- Name: ${studentName}
- Class: ${className}
- Average: ${averagePercentage}%
- Total Score: ${totalScore}
- Subjects & Grades:
${subjectGrades.map((g) => `  * ${g.subject}: ${g.grade} (CA1: ${g.ca1}, CA2: ${g.ca2}, Exam: ${g.exam})`).join('\n')}

Guidelines for Remarks:
1. **formMasterRemark**: Written by the Form Master. Should be specific to the subject performance, encouraging, pointing out strengths and areas for improvement. Max 2-3 sentences.
2. **principalRemark**: Written by the Principal. Should be a brief, formal, high-level summary of the overall academic performance. Max 1-2 sentences.
3. Keep the tone professional and consistent with Nigerian school standards.

Respond ONLY with valid JSON. Do not include markdown formatting or backticks around the JSON.
Example format:
{
  "formMasterRemark": "...",
  "principalRemark": "..."
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response from AI");
    }

    // Try to parse the response, stripping any markdown JSON blocks if the model included them despite instructions
    const cleanJsonString = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const result = JSON.parse(cleanJsonString);

    return {
      success: true,
      data: {
        formMasterRemark: result.formMasterRemark || "",
        principalRemark: result.principalRemark || "",
      },
    };
  } catch (error) {
    console.error("AI Remark Generation Error:", error);
    return {
      success: false,
      error: "Failed to generate remarks. Please check the AI configuration.",
    };
  }
}
