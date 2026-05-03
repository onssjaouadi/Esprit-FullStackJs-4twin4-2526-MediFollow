// lib/mongodb.ts
// MongoDB client singleton for Next.js (prevents multiple connections)

import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.DATABASE_URL;
if (!uri) throw new Error("Please define the DATABASE_URL environment variable");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In dev, use a global variable so hot reloads don't create new clients
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri as string);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, create a new client per lambda
  client = new MongoClient(uri as string);
  clientPromise = client.connect();
}

export default clientPromise;