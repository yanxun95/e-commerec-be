import express, { NextFunction } from "express";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers";
import userRouter from "./services/users";
import passport from "passport";
import googleStrategy from "./auth/oAuth";
import cors from "cors";
import session from "express-session";
import productRouter from "./services/products";
import { MyError } from "./services/function";

const app = express();

const whiteList = ["http://localhost:3000"];
const corsOptions = {
  origin: (
    origin: string,
    callback: (arg0: Error | null, arg1: boolean | undefined) => void
  ) => {
    if (whiteList.some((allowedUrl) => allowedUrl === origin)) {
      callback(null, true);
    } else {
      const error = new MyError({
        status: 403,
        message: "Forbidden",
      });
      callback(error, false);
    }
  },
};

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: process.env.COOKIE_KEY as string,
    saveUninitialized: true,
    resave: true,
    cookie: { secure: true },
  })
);
//MIDDLEWARES
passport.use("google", googleStrategy);
app.use(cors(corsOptions as any));
app.use(express.json());
app.use(passport.initialize());

//ROUTERS
app.use("/user", userRouter);
app.use("/product", productRouter);

//ERROR
app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

export default app;
