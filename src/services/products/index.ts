import express, { Response, Request, NextFunction } from "express";
import ProductModel, { IProduct } from "./schema";
import UserModel, { IUser } from "../users/schema";
import CommentModel, { IComment } from "../comments/schema";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import createHttpError from "http-errors";
import multer from "multer";
import { JWTAuthMiddleware } from "../../auth/tools";
import { deleteImg } from "../function";
import mongoose, { ObjectId } from "mongoose";

const productRouter = express.Router();
const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "E-commerec/ProductImages",
      // format: "jpeg",
    };
  },
});

productRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductModel.find().limit(100);
      res.status(200).send(product);
    } catch (error) {
      next(error);
    }
  }
);

productRouter.get(
  "/:productId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductModel.findById(
        req.params.productId
      ).populate("comment");
      if (product) res.status(200).send(product);
      else
        next(
          createHttpError(
            404,
            `product with id ${req.params.productId} is not found`
          )
        );
    } catch (error) {
      next(error);
    }
  }
);

productRouter.post(
  "/newProduct",
  JWTAuthMiddleware,
  multer({ storage: cloudStorage }).single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productDetails: IProduct = {
        name: req.body.name as string,
        brand: req.body.brand as string,
        price: req.body.price,
        image: req.file?.path as string,
        description: req.body.description as string,
        quantity: req.body.quantity,
      };
      const findProduct = await ProductModel.findOne({
        name: productDetails.name,
      });
      if (findProduct) {
        res.status(200).send("The product is already exist!");
        await deleteImg(productDetails.image as string);
      } else {
        const newProduct = new ProductModel(productDetails);
        const { _id } = await newProduct.save();
        res.status(201).send(_id as unknown as string);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

productRouter.put(
  "/:productId",
  JWTAuthMiddleware,
  multer({ storage: cloudStorage }).single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.productId;
      const productDetails: IProduct = {
        name: req.body.name as string,
        brand: req.body.brand as string,
        price: req.body.price,
        image: req.file?.path as string,
        description: req.body.description as string,
        quantity: req.body.quantity,
      };
      const productInfo = await ProductModel.findById(productId);
      if (productInfo && productInfo.image) {
        await deleteImg(productInfo.image);
      } else {
        if (productDetails.image) await deleteImg(productDetails.image);
      }
      const updateProduct = await ProductModel.findByIdAndUpdate(
        productId,
        productDetails,
        { new: true }
      );
      if (updateProduct) res.status(200).send(updateProduct);
      else
        next(
          createHttpError(404, `Product with id ${productId} is not found!`)
        );
    } catch (error) {
      next(error);
    }
  }
);

productRouter.delete(
  "/:productId",
  JWTAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.productId;
      const productIdWithObjectTypes = productId as unknown as ObjectId;
      const deletedProduct = await ProductModel.findByIdAndDelete(productId);
      if (deletedProduct) {
        await deleteImg(deletedProduct.image as string);
        res.status(204).send();
      } else {
        next(
          createHttpError(404, `Product with id ${productId} is not found `)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

productRouter.post(
  "/comment",
  JWTAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as IUser;
      let userId: string = "";
      if (user !== undefined && user._id !== undefined)
        userId = user._id.toString() as string;
      const commentDetails: IComment = {
        comment: req.body.comment as string,
        userId: new mongoose.Types.ObjectId(userId),
        productId: new mongoose.Types.ObjectId(req.body.productId),
      };
      const newComment = new CommentModel(commentDetails);
      const { _id } = await newComment.save();
      await ProductModel.findByIdAndUpdate(
        commentDetails.productId,
        { $push: { comment: _id } },
        { new: true }
      );
      res.status(201).send(_id as unknown as string);
    } catch (error) {
      next(error);
    }
  }
);

productRouter.put(
  "/comment/:commentId",
  JWTAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as IUser;
      let userId: string = "";
      if (user !== undefined && user._id !== undefined)
        userId = user._id.toString() as string;
      const commentId = req.params.commentId;
      const checkUser = await CommentModel.findById(commentId);
      if (checkUser) {
        const userIdType: string = checkUser?.userId?.toString() as string;
        if (userIdType === userId) {
          const updateComment = await CommentModel.findByIdAndUpdate(
            req.params.commentId,
            req.body,
            { new: true }
          );
          res.status(201).send(updateComment);
        } else
          next(
            createHttpError(
              403,
              "Only the author of the comment can edit the comment!"
            )
          );
      } else next(createHttpError(404, "Comment not found!"));
    } catch (error) {
      next(error);
    }
  }
);

productRouter.delete(
  "/comment/:commentId",
  JWTAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.commentId;
      const productId = req.body.productId;
      const deletedComment = await CommentModel.findByIdAndDelete(commentId);
      if (deletedComment) {
        await ProductModel.findByIdAndUpdate(
          productId,
          { $pull: { comment: commentId as Object } },
          { new: true }
        );
        res.status(204).send();
      } else {
        next(
          createHttpError(404, `Comment with id ${commentId} is not found `)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default productRouter;
