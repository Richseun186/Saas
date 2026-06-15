export type RawScore = {
  subjectId: string;
  ca1?: number; // e.g., out of 20
  ca2?: number; // e.g., out of 20
  exam?: number; // e.g., out of 60
};

export type ComputedResult = RawScore & {
  total: number;
  grade: string;
  remark: string;
};

/**
 * Assigns a WAEC standard grade and remark based on the total score.
 * A1 (75-100), B2 (70-74), B3 (65-69), C4 (60-64), C5 (55-59), C6 (50-54), D7 (45-49), E8 (40-44), F9 (0-39)
 */
export function getGradeAndRemark(total: number): { grade: string; remark: string } {
  if (total >= 75) return { grade: 'A1', remark: 'Excellent' };
  if (total >= 70) return { grade: 'B2', remark: 'Very Good' };
  if (total >= 65) return { grade: 'B3', remark: 'Good' };
  if (total >= 60) return { grade: 'C4', remark: 'Credit' };
  if (total >= 55) return { grade: 'C5', remark: 'Credit' };
  if (total >= 50) return { grade: 'C6', remark: 'Credit' };
  if (total >= 45) return { grade: 'D7', remark: 'Pass' };
  if (total >= 40) return { grade: 'E8', remark: 'Pass' };
  return { grade: 'F9', remark: 'Fail' };
}

/**
 * Result Computation Engine
 * Computes the total marks, assigns grades/remarks for an array of subject scores.
 * Kept highly efficient and synchronous to stay within Netlify's execution limit.
 */
export function computeStudentResults(scores: RawScore[]): ComputedResult[] {
  return scores.map((score) => {
    // Treat scores as numbers and default to 0 if undefined/null
    const ca1 = Number(score.ca1) || 0;
    const ca2 = Number(score.ca2) || 0;
    const exam = Number(score.exam) || 0;
    
    const total = ca1 + ca2 + exam;
    const { grade, remark } = getGradeAndRemark(total);
    
    return {
      ...score,
      total,
      grade,
      remark,
    };
  });
}

export type StudentTermPerformance = {
  studentId: string;
  results: ComputedResult[];
};

export type StudentRankedPerformance = StudentTermPerformance & {
  termTotalScore: number;
  averagePercentage: number;
  classPosition: string; // e.g., '1st', '2nd', '3rd'
};

/**
 * Calculates term totals, averages, and assigns class positions for an array of students.
 */
export function computeClassPositions(students: StudentTermPerformance[]): StudentRankedPerformance[] {
  // 1. Calculate total score and average for each student
  const studentsWithTotals = students.map(student => {
    const termTotalScore = student.results.reduce((sum, res) => sum + res.total, 0);
    const averagePercentage = student.results.length > 0 
      ? termTotalScore / student.results.length 
      : 0;
      
    return {
      ...student,
      termTotalScore,
      averagePercentage: Number(averagePercentage.toFixed(2)),
    };
  });

  // 2. Sort students by total score descending to determine rank
  studentsWithTotals.sort((a, b) => b.termTotalScore - a.termTotalScore);

  // 3. Assign positions (handling ties)
  let currentRank = 1;
  let skip = 0;
  let previousScore: number | null = null;

  return studentsWithTotals.map((student) => {
    if (previousScore !== null && student.termTotalScore === previousScore) {
      skip++;
    } else {
      currentRank = currentRank + skip;
      skip = 1;
    }
    previousScore = student.termTotalScore;

    return {
      ...student,
      classPosition: getOrdinalSuffix(currentRank),
    };
  });
}

// Helper for ordinal suffix ('1st', '2nd', '3rd', etc.)
function getOrdinalSuffix(i: number): string {
  const j = i % 10, k = i % 100;
  if (j === 1 && k !== 11) return i + "st";
  if (j === 2 && k !== 12) return i + "nd";
  if (j === 3 && k !== 13) return i + "rd";
  return i + "th";
}
