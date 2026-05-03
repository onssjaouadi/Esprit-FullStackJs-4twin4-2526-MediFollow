import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const sa = await prisma.user.findFirst({
    where: { email: "superadmin@medifollow.local" }
  });

  if (!sa) {
    console.log("No superadmin found by email.");
    return;
  }

  const newPassword = "SuperAdmin123!";
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: sa.id },
    data: { 
      passwordHash,
      role: "SUPERADMIN",
      isDeleted: false,
      isActive: true,
      isSuspended: false
    }
  });

  console.log(`Email: ${sa.email}`);
  console.log(`Password: ${newPassword}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
