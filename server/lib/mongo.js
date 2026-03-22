import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL || "";

export async function connectMongo() {
  if (!MONGO_URL) {
    console.warn("[mongo] MONGO_URL not set. Running in in-memory fallback mode.");
    return;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URL, { autoIndex: true });
  console.log("[mongo] connected");
}

export const isMongoEnabled = () => Boolean(MONGO_URL);
