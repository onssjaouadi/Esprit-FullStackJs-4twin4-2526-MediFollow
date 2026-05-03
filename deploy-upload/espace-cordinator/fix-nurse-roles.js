const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixNurseRoles() {
  console.log("🔧 Fixing nurse roles in database...\n");

  const nurseEmails = ["fatima.nurse@medifollow.health", "leila.nurse@medifollow.health"];

  for (const email of nurseEmails) {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: Role.NURSE },
    });
    console.log(`✅ Updated ${updated.firstName} ${updated.lastName} -> NURSE`);
  }

  console.log("\n✨ Done! Now checking users...\n");

  const nurses = await prisma.user.findMany({
    where: { role: Role.NURSE },
    select: { firstName: true, lastName: true, email: true, role: true },
  });

  const doctors = await prisma.user.findMany({
    where: { role: Role.DOCTOR },
    select: { firstName: true, lastName: true, email: true, role: true },
  });

  console.log(`📊 NURSES (${nurses.length}):`);
  nurses.forEach((u) => console.log(`  - ${u.firstName} ${u.lastName} (${u.email})`));

  console.log(`\n📊 DOCTORS (${doctors.length}):`);
  doctors.forEach((u) => console.log(`  - ${u.firstName} ${u.lastName} (${u.email})`));

  await prisma.$disconnect();
}

fixNurseRoles();
