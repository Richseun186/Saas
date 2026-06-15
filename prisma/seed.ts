import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const JUNIOR_SUBJECTS = [
  { name: "Mathematics", code: "MAT", category: "JUNIOR_CORE" },
  { name: "English Language", code: "ENG", category: "JUNIOR_CORE" },
  { name: "Basic Science", code: "BSC", category: "JUNIOR_CORE" },
  { name: "Basic Technology", code: "BTE", category: "JUNIOR_CORE" },
  { name: "Social Studies", code: "SOS", category: "JUNIOR_CORE" },
  { name: "Civic Education", code: "CIV", category: "JUNIOR_CORE" },
  { name: "Cultural and Creative Arts", code: "CCA", category: "JUNIOR_ELECTIVE" },
  { name: "Christian Religious Studies", code: "CRS", category: "JUNIOR_ELECTIVE" },
  { name: "Islamic Religious Studies", code: "IRS", category: "JUNIOR_ELECTIVE" },
  { name: "Physical and Health Education", code: "PHE", category: "JUNIOR_ELECTIVE" },
  { name: "Business Studies", code: "BST", category: "JUNIOR_ELECTIVE" },
  { name: "French", code: "FRE", category: "JUNIOR_ELECTIVE" },
  { name: "Computer Studies", code: "COM", category: "JUNIOR_CORE" },
  { name: "Home Economics", code: "HEC", category: "JUNIOR_ELECTIVE" },
  { name: "Agricultural Science", code: "AGR", category: "JUNIOR_ELECTIVE" },
];

const SENIOR_SUBJECTS = [
  { name: "Mathematics", code: "MAT", category: "SENIOR_CORE" },
  { name: "English Language", code: "ENG", category: "SENIOR_CORE" },
  { name: "Civic Education", code: "CIV", category: "SENIOR_CORE" },
  { name: "Biology", code: "BIO", category: "SENIOR_SCIENCE" },
  { name: "Physics", code: "PHY", category: "SENIOR_SCIENCE" },
  { name: "Chemistry", code: "CHE", category: "SENIOR_SCIENCE" },
  { name: "Further Mathematics", code: "FMA", category: "SENIOR_SCIENCE" },
  { name: "Agricultural Science", code: "AGR", category: "SENIOR_SCIENCE" },
  { name: "Computer Science", code: "COM", category: "SENIOR_SCIENCE" },
  { name: "Economics", code: "ECO", category: "SENIOR_COMMERCIAL" },
  { name: "Commerce", code: "CMR", category: "SENIOR_COMMERCIAL" },
  { name: "Financial Accounting", code: "FAC", category: "SENIOR_COMMERCIAL" },
  { name: "Government", code: "GOV", category: "SENIOR_ARTS" },
  { name: "Literature in English", code: "LIT", category: "SENIOR_ARTS" },
  { name: "Christian Religious Studies", code: "CRS", category: "SENIOR_ARTS" },
  { name: "Islamic Religious Studies", code: "IRS", category: "SENIOR_ARTS" },
  { name: "History", code: "HIS", category: "SENIOR_ARTS" },
  { name: "Geography", code: "GEO", category: "SENIOR_ARTS" },
  { name: "French", code: "FRE", category: "SENIOR_ARTS" },
];

async function main() {
  console.log("Seeding SubjectBank...");

  // Combine and deduplicate subjects by name to avoid unique constraint violations
  // if some subjects exist in both Junior and Senior (like Mathematics)
  const allSubjectsMap = new Map();

  [...JUNIOR_SUBJECTS, ...SENIOR_SUBJECTS].forEach((subject) => {
    if (!allSubjectsMap.has(subject.name)) {
      allSubjectsMap.set(subject.name, subject);
    }
  });

  const subjectsToInsert = Array.from(allSubjectsMap.values());

  for (const subject of subjectsToInsert) {
    await prisma.subjectBank.upsert({
      where: { name: subject.name },
      update: {},
      create: {
        name: subject.name,
        category: subject.category,
      },
    });
  }

  console.log(`Successfully seeded ${subjectsToInsert.length} subjects into the SubjectBank.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
