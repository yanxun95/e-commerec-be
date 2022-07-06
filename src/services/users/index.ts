import express from "express";
import UserModel from "./schema";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { param } from "express-validator";

const userRouter = express.Router();
// const cloudStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: ,
//   },
// });

userRouter.get("/", async (req, res, next) => {
  try {
    const user = await UserModel.find().limit(100);
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/register", async (req, res, next) => {
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
});

export default userRouter;
