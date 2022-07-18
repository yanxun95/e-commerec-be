import express, { Response, Request, NextFunction } from "express";
import UserModel, { IUser } from "./schema";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import createHttpError from "http-errors";
import { JWTAuthenticate, JWTAuthMiddleware } from "../../auth/tools";
import multer from "multer";
import passport from "passport";
import { deleteImg } from "../function";

const userRouter = express.Router();
const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "E-commerec/UserImages",
      // format: "jpeg",
    };
  },
});

userRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.find().limit(100).populate("product");
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
        res.status(201).send(_id as unknown as string);
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
        const accessToken = (await JWTAuthenticate(user)) as string;
        res
          .status(200)
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
      const user = await UserModel.findById(req.params.id).populate("product");
      if (user) res.status(200).send(user);
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
  "/",
  JWTAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as IUser;
      const updateUser = await UserModel.findByIdAndUpdate(user, req.body, {
        new: true,
      });
      if (updateUser) res.status(200).send(updateUser);
    } catch (error) {
      next(error);
    }
  }
);

userRouter.post(
  "/userImage",
  JWTAuthMiddleware,
  multer({ storage: cloudStorage }).single("userImg"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const userId = req.user as IUser;
        const userImage = await UserModel.findByIdAndUpdate(
          userId,
          { $set: { image: req.file.path } },
          { new: true }
        );
        if (userImage) res.status(201).send(userImage);
        else next(createHttpError(404, "User not found!"));
      } else next(createHttpError(404, "There is no image!"));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

userRouter.put(
  "/userImage",
  JWTAuthMiddleware,
  multer({ storage: cloudStorage }).single("userImg"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const userId = req.user as IUser;
        const userInfo = await UserModel.findById(userId);
        if (userInfo && userInfo.image) await deleteImg(userInfo.image);

        const userImage = await UserModel.findByIdAndUpdate(
          userId,
          { $set: { image: req.file.path } },
          { new: true }
        );

        if (userImage) res.status(201).send(userImage.image);
        else next(createHttpError(404, "User not found!"));
      } else next(createHttpError(404, "There is no image!"));
    } catch (error) {
      next(error);
    }
  }
);

userRouter.get(
  "/google/login",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
  "/google/redirect",
  passport.authenticate("google"),
  (req, res, next) => {
    console.log(req.user);
    res.status(200).send(req.user);
    // res.redirect(`http://localhost:3000?accessToken=${req.user.token}}`);
  }
);

export default userRouter;
