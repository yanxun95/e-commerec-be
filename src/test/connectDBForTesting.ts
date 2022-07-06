import mongoose from "mongoose";

export async function connectDBForTesting() {
  try {
    const dbUri: string = process.env.MONGO_CONNECTION as string;
    const dbName: string = "testing";
    await mongoose.connect(dbUri, {
      dbName,
      autoCreate: true,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function disconnectDBForTesting() {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.log("DB disconnect error");
  }
}
