const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAndUpdatePatient() {
  try {
    // 1. Find the patient
    const patient = await prisma.user.findFirst({
      where: {
        OR: [
          {
            firstName: { contains: 'mouna', mode: 'insensitive' },
            lastName: { contains: 'hajj', mode: 'insensitive' }
          },
          {
            firstName: { contains: 'mouna hajj', mode: 'insensitive' }
          }
        ]
      }
    });

    if (!patient) {
      console.log("Patient 'mouna hajj' not found.");
      return;
    }

    console.log("Found patient:", JSON.stringify(patient, null, 2));

    // 2. Update the phone number
    const updatedPatient = await prisma.user.update({
      where: { id: patient.id },
      data: { phoneNumber: "+216 28609851" }
    });

    console.log("Updated patient:", JSON.stringify(updatedPatient, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

findAndUpdatePatient();
