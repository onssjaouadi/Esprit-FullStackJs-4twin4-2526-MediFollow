const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("📊 Checking users in database...\n");

  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true },
    orderBy: { role: "asc" },
  });

  console.log(`📝 Total users: ${users.length}\n`);

  // Group by role
  const byRole = {};
  users.forEach((u) => {
    if (!byRole[u.role]) byRole[u.role] = [];
    byRole[u.role].push(u);
  });

  Object.entries(byRole).forEach(([role, userList]) => {
    console.log(`\n${role}s (${userList.length}):`);
    userList.forEach((u) => {
      console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) ${u.isActive ? "✓" : "✗"}`);
    });
  });

  await prisma.$disconnect();
}

checkUsers();
