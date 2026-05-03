const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assign() {
  const patientEmail = 'arijj@medifollow.health';
  const doctorEmail = 'arij.mahjoub@esprit.tn';

  const patientUser = await prisma.user.findUnique({ where: { email: patientEmail } });
  const doctorUser = await prisma.user.findUnique({ where: { email: doctorEmail } });

  if (!patientUser || !doctorUser) {
    console.error('User not found');
    process.exit(1);
  }

  await (prisma).accessGrant.upsert({
    where: { patientId_doctorId: { patientId: patientUser.id, doctorId: doctorUser.id } },
    update: { isActive: true },
    create: {
      patientId: patientUser.id,
      doctorId: doctorUser.id,
      isActive: true,
      durationDays: 365,
      grantedAt: new Date()
    }
  });

  console.log(`Success: ${patientEmail} (${patientUser.id}) assigned to ${doctorEmail} (${doctorUser.id})`);
  process.exit(0);
}

assign();
