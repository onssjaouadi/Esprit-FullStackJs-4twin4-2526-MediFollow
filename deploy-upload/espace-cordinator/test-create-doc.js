const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDoc() {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: "test.doctor." + Date.now() + "@medifollow.com",
        firstName: "Doc",
        lastName: "Test",
        passwordHash: "dummyHash",
        role: "DOCTOR",
        isActive: true,
      }
    });
    console.log("Created doc:", newUser.id);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testDoc();
