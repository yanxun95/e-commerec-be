import express from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import listEndpoints from "express-list-endpoints";

console.log("hello");
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3001;

const mongoConnection: string = process.env.MONGO_CONNECTION as string;
mongoose.connect(mongoConnection);
mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  httpServer.listen(port, () => {
    console.table(listEndpoints(app));
    console.log(`Server running on port ${port}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
