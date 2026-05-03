const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreate() {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: "test.creation." + Date.now() + "@test.com",
        firstName: "Test",
        lastName: "User",
        passwordHash: "dummyHash",
        role: "PATIENT",
        isActive: true,
      }
    });
    console.log("Created user:", newUser.id);
  } catch (error) {
    console.error("Failed to create user:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCreate();
