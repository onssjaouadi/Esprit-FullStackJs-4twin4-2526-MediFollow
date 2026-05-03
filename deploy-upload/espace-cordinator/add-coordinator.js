const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Get credentials from command line arguments
  const email = process.argv[2];
  const password = process.argv[3];
  const firstName = process.argv[4] || 'Coordinateur';
  const lastName = process.argv[5] || 'MediFollow';

  if (!email || !password) {
    console.log('=================================================================');
    console.log('🔴 UTILISATION: node add-coordinator.js <email> <password> [prenom] [nom]');
    console.log('Exemple: node add-coordinator.js coord1@medifollow.com Pwd123! Alice Dupont');
    console.log('=================================================================');
    process.exit(1);
  }

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`❌ Un utilisateur avec l'email "${email}" existe déjà.`);
      process.exit(1);
    }

    // 2. Hash the password
    console.log(`Hachage du mot de passe...`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create the Coordinator in the Database
    console.log(`Création du compte Coordinateur...`);
    const coordinator = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'COORDINATOR',
        isActive: true,
        isApproved: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    });

    console.log('✅ Compte Coordinateur créé avec succès !');
    console.log('--------------------------------------------------');
    console.log(coordinator);
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('❌ Erreur lors de la création du coordinateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
