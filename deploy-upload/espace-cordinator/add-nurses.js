const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function addNurses() {
  console.log("👨‍⚕️ Adding nurses to database...\n");

  const nurses = [
    { firstName: "Fatima", lastName: "Ahmed", email: "fatima.nurse@medifollow.health" },
    { firstName: "Leila", lastName: "Hassan", email: "leila.nurse@medifollow.health" },
  ];

  for (const nurse of nurses) {
    const existing = await prisma.user.findUnique({
      where: { email: nurse.email },
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash("TempPassword123!", 12);
      const newNurse = await prisma.user.create({
        data: {
          email: nurse.email,
          firstName: nurse.firstName,
          lastName: nurse.lastName,
          passwordHash: hashedPassword,
          role: Role.NURSE,
          isActive: true,
        },
      });
      console.log(`✅ Created: ${newNurse.firstName} ${newNurse.lastName}`);
    } else {
      console.log(`⏭️ Already exists: ${nurse.email}`);
    }
  }

  console.log("\n📊 Updated user list:");
  const users = await prisma.user.findMany({
    where: { role: { in: ["DOCTOR", "NURSE"] } },
    select: { firstName: true, lastName: true, email: true, role: true },
  });

  users.forEach((u) => {
    console.log(`  - ${u.firstName} ${u.lastName} (${u.role})`);
  });

  await prisma.$disconnect();
}

addNurses();
