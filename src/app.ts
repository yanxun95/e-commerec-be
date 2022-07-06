import express from "express";
import userRouter from "./services/users";

const app = express();

//MIDDLEWARES
app.use(express.json());

//ROUTERS
app.use("/user", userRouter);

export default app;
