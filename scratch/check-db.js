const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAccess() {
  try {
    const patientEmail = "arij.mhjb1@gmail.com";
    const user = await prisma.user.findUnique({
      where: { email: patientEmail },
      include: {
        patient: true
      }
    });

    if (!user) {
      console.log("Patient user not found");
      return;
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

    const grants = await prisma.accessGrant.findMany({
      where: { patientId: user.id }
    });

    console.log(`Found ${grants.length} grants for this patient:`);
    for (const grant of grants) {
      console.log(`- Doctor ID: ${grant.doctorId}, Active: ${grant.isActive}, Expires: ${grant.expiresAt}`);
      const doctor = await prisma.user.findUnique({
        where: { id: grant.doctorId },
        include: { doctorProfile: true }
      });
      if (doctor) {
        console.log(`  Doctor Name: ${doctor.firstName} ${doctor.lastName}`);
        console.log(`  Specialty: ${doctor.doctorProfile?.specialty}`);
      }
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccess();
