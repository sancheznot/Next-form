
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "../database/mongodb";

export const getMongoAdapter = async () => {
  const client = await clientPromise;
  return MongoDBAdapter(client);
};