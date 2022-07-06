import express, { Response, Request, NextFunction } from "express";
import UserModel from "./schema";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { param } from "express-validator";
import createHttpError from "http-errors";
import { JWTAuthenticate, JWTAuthMiddleware } from "../../auth/tools";

const userRouter = express.Router();
// const cloudStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: ,
//   },
// });

userRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.find().limit(100);
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
});

userRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const findEmail = await UserModel.findOne({ email });
      if (findEmail) {
        res.status(200).send("The email is already exist!");
      } else {
        const newUser = new UserModel(req.body);
        const { _id } = await newUser.save();
        res.status(201).send({ _id });
      }
    } catch (error) {
      next(error);
    }
  }
);

userRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.checkCredentials(email, password);

      if (user) {
        const accessToken = await JWTAuthenticate(user);
        res
          .status(201)
          .cookie("accessToken", accessToken, {
            httpOnly: false,
          })
          .send(accessToken);
      } else {
        next(createHttpError(401, "Credentials are not ok!"));
      }
    } catch (error) {
      next(error);
    }
  }
);

userRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.findById(req.params.id);
      if (user) res.send(user);
      else
        next(
          createHttpError(404, `profile with id ${req.params.id} is not found`)
        );
    } catch (error) {
      next(error);
    }
  }
);

userRouter.put(
  "/:id",
  JWTAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updateUser = await UserModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (updateUser) res.send(updateUser);
      else
        next(
          createHttpError(404, `profile with id ${req.params.id} is not found`)
        );
    } catch (error) {
      next(error);
    }
  }
);

export default userRouter;
