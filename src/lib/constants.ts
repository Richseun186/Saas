// Trait labels for display
export const AFFECTIVE_TRAITS = [
  { key: "punctuality",   label: "Punctuality" },
  { key: "neatness",      label: "Neatness" },
  { key: "politeness",    label: "Politeness" },
  { key: "honesty",       label: "Honesty" },
  { key: "attentiveness", label: "Attentiveness" },
  { key: "perseverance",  label: "Perseverance" },
  { key: "cooperation",   label: "Cooperation" },
  { key: "leadership",    label: "Leadership" },
] as const;

export const PSYCHOMOTOR_TRAITS = [
  { key: "handwriting",    label: "Handwriting" },
  { key: "sports",         label: "Sports" },
  { key: "drawing",        label: "Drawing" },
  { key: "verbal_fluency", label: "Verbal Fluency" },
  { key: "musical_skill",  label: "Musical Skill" },
  { key: "computer_skill", label: "Computer Skill" },
] as const;

export const SCORE_LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent",
};
