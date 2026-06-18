import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding an Admin user...");

  const hashedPassword = await bcryptjs.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gradesync.edu" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@gradesync.edu",
      password: hashedPassword,
      roles: ["ADMIN"],
    },
  });

  console.log(`Created Admin User: ${adminUser.email} / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
