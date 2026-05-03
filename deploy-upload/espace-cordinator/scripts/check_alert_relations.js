// scripts/check_alert_relations.js
// Script to check and print alert relations in MongoDB for Prisma compatibility

const { MongoClient, ObjectId } = require('mongodb');


const uri = process.env.DATABASE_URL;
if (!uri) {
  throw new Error('DATABASE_URL environment variable is not set.');
}
let dbName = process.env.MONGODB_DB;
if (!dbName) {
  const match = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/);
  dbName = match ? match[1] : undefined;
}
if (!dbName) {
  throw new Error('Database name not found. Set MONGODB_DB or include it in your DATABASE_URL.');
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const alerts = await db.collection('alerts').find({}).toArray();
  const patients = await db.collection('patients').find({}).toArray();
  const users = await db.collection('users').find({}).toArray();

  for (const alert of alerts) {
    const patient = patients.find(p => p._id.toString() === alert.patientId);
    const acknowledgedBy = alert.acknowledgedById ? users.find(u => u._id.toString() === alert.acknowledgedById) : null;
    const resolvedBy = alert.resolvedById ? users.find(u => u._id.toString() === alert.resolvedById) : null;
    console.log('--- Alert:', alert._id.toString());
    console.log('  patientId:', alert.patientId, '->', patient ? 'OK' : 'NOT FOUND');
    console.log('  acknowledgedById:', alert.acknowledgedById, '->', acknowledgedBy ? 'OK' : 'NOT FOUND');
    console.log('  resolvedById:', alert.resolvedById, '->', resolvedBy ? 'OK' : 'NOT FOUND');
  }

  await client.close();
}

main().catch(console.error);