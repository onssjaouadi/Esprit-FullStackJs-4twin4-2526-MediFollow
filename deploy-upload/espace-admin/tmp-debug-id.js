require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

(async () => {
  const uri = process.env.DATABASE_URL;
  const dbName = process.env.MONGODB_DB || ((uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/) || [])[1]);
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const id = '69d45ac4f67bd0fdade23527';
  const pById = await db.collection('patients').findOne({ _id: new ObjectId(id) }).catch(()=>null);
  const pByUserId = await db.collection('patients').findOne({ userId: id });
  const u = await db.collection('users').findOne({ _id: new ObjectId(id) }).catch(()=>null);

  console.log('PATIENT_BY_ID', pById ? { _id: String(pById._id), userId: pById.userId } : null);
  console.log('PATIENT_BY_USERID', pByUserId ? { _id: String(pByUserId._id), userId: pByUserId.userId } : null);
  console.log('USER_BY_ID', u ? { _id: String(u._id), role: u.role, email: u.email } : null);

  const samplePatients = await db.collection('patients').find({}).limit(5).toArray();
  console.log('SAMPLE_PATIENT_IDS', samplePatients.map(p=>({id:String(p._id), userId:p.userId})));
  await client.close();
})();
