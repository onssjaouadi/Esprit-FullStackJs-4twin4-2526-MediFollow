const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const client = await MongoClient.connect(process.env.DATABASE_URL);
  const db = client.db();
  const svc = await db.collection('services').findOne({ serviceName: 'admin service test' });
  if(svc) {
    console.log('Service Name:', svc.serviceName);
    console.log('Patient IDs:', svc.patientIds);
    if(svc.patientIds.length > 0) {
       console.log('First patient ID type:', typeof svc.patientIds[0]);
       console.log('Is ObjectId?', svc.patientIds[0] instanceof ObjectId);
    }
    console.log('Team IDs:', svc.teamIds);
  } else {
    console.log('Service not found');
  }
  await client.close();
}
run();
