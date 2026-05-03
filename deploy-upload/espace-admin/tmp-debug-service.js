require('dotenv').config();
const { MongoClient } = require('mongodb');

(async () => {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error('DATABASE_URL missing');
  const dbName = process.env.MONGODB_DB || ((uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/) || [])[1]);
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const svc = await db.collection('services').findOne({ serviceName: 'peddd' });
  console.log('SERVICE:', svc ? { _id: String(svc._id), serviceName: svc.serviceName } : null);

  if (svc) {
    const a1 = await db.collection('service_assignments').findOne({ serviceId: String(svc._id) });
    const a2 = await db.collection('service_assignments').findOne({ serviceId: svc._id });
    console.log('ASSIGNMENT_BY_STRING:', a1 ? { serviceId: a1.serviceId, patientIds: a1.patientIds, teamIds: a1.teamIds, updatedAt: a1.updatedAt } : null);
    console.log('ASSIGNMENT_BY_OBJECTID:', a2 ? { serviceId: String(a2.serviceId), patientIds: a2.patientIds, teamIds: a2.teamIds, updatedAt: a2.updatedAt } : null);
  }

  const patientCount = await db.collection('patients').countDocuments({});
  const usersByRole = await db.collection('users').aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  console.log('PATIENT_COUNT:', patientCount);
  console.log('USERS_BY_ROLE:', usersByRole);

  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
