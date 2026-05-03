const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const svc = await prisma.service.findFirst({
    where: {
      patientIds: { isEmpty: false }
    }
  });
  if(svc) {
    console.log('First patient ID:', svc.patientIds[0]);
    console.log('Type:', typeof svc.patientIds[0]);
  } else {
    console.log('No services with patients found');
  }
  process.exit(0);
}
run();
