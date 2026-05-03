const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const users = await prisma.user.findMany();
    console.log("USERS_LENGTH:", users.length);
  } catch (error) {
    console.error("PRISMA_ERROR_MESSAGE:", error.message);
    console.error("PRISMA_ERROR_CODE:", error.code);
  } finally {
    await prisma.$disconnect();
  }
}
run();
