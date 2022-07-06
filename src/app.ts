import express from "express";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers";
import userRouter from "./services/users";

const app = express();

//MIDDLEWARES
app.use(express.json());

//ROUTERS
app.use("/user", userRouter);

//ERROR
app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

export default app;
