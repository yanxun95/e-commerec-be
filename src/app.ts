import express from "express";
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

const app = express();
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
app.use(cors());
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
