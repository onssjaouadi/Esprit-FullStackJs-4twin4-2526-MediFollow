/**
 * Script to fix patient login credentials
 * Run: npx ts-node fix-patient-login.ts
 */

const prisma = require("./lib/prisma").default;
const { hashPassword } = require("./lib/utils");

const PATIENT_EMAIL = "nizarchaieb44@gmail.com";
const PATIENT_PASSWORD = "Nizar@2013";

async function main() {
  try {
    console.log("🔧 Fixing patient account login...");

    // Find the user
    let user = await prisma.user.findUnique({
      where: { email: PATIENT_EMAIL },
    });

    if (!user) {
      console.log(`❌ User not found: ${PATIENT_EMAIL}`);
      console.log(`📝 Creating new account...`);

      const hashedPassword = await hashPassword(PATIENT_PASSWORD);

      user = await prisma.user.create({
        data: {
          email: PATIENT_EMAIL,
          passwordHash: hashedPassword,
          firstName: "Nizar",
          lastName: "Chaieb",
          role: "PATIENT",
          isActive: true,
          isApproved: true,
          phoneNumber: "+216 28609851",
        },
      });

      console.log(`✅ Account created: ${user.id}`);

      // Create patient profile if needed
      const existingPatient = await prisma.patient.findFirst({
        where: { userId: user.id },
      });

      if (!existingPatient) {
        await prisma.patient.create({
          data: {
            userId: user.id,
            medicalRecordNumber: `MR-${Date.now()}`,
            dateOfBirth: new Date("1990-01-15"),
            gender: "MALE",
            bloodType: "O_POSITIVE",
          },
        });
        console.log(`✅ Patient profile created`);
      }
    } else {
      console.log(`✅ Found existing account: ${user.email}`);

      // Hash the new password
      const hashedPassword = await hashPassword(PATIENT_PASSWORD);

      // Update user with correct password and activation
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          isActive: true,
          isApproved: true,
          phoneNumber: "+216 28609851",
        },
      });

      console.log(`✅ Password updated`);
      console.log(`✅ Account activated`);

      // Ensure patient profile exists
      let patient = await prisma.patient.findFirst({
        where: { userId: user.id },
      });

      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            userId: user.id,
            medicalRecordNumber: `MR-${Date.now()}`,
            dateOfBirth: new Date("1990-01-15"),
            gender: "MALE",
            bloodType: "O_POSITIVE",
          },
        });
        console.log(`✅ Patient profile created`);
      } else {
        console.log(`✅ Patient profile verified`);
      }
    }

    console.log("\n✨ Login credentials:");
    console.log(`📧 Email: ${PATIENT_EMAIL}`);
    console.log(`🔑 Password: ${PATIENT_PASSWORD}`);
    console.log(`\n🔓 Try logging in now!`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
