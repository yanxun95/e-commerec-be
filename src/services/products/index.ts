import express, { Response, Request, NextFunction } from "express";
import ProductModel, { IProduct } from "./schema";
import UserModel from "../users/schema";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import createHttpError from "http-errors";
import multer from "multer";
import { JWTAuthMiddleware } from "../../auth/tools";
import { deleteImg } from "../function";
import mongoose, { ObjectId, Schema } from "mongoose";

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
      const product = await ProductModel.findById(req.params.productId);
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
        userId: new mongoose.Types.ObjectId(req.body.userId),
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
        await UserModel.findByIdAndUpdate(
          productDetails.userId,
          { $push: { product: _id } },
          { new: true }
        );
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
      const product = await ProductModel.findById(req.params.productId);
      const productIdWithObjectTypes = productId as unknown as ObjectId;
      const userId = product?.userId as unknown as string;
      const deletedProduct = await ProductModel.findByIdAndDelete(productId);
      if (deletedProduct) {
        await UserModel.findByIdAndUpdate(
          userId,
          { $pull: { product: productIdWithObjectTypes } },
          { new: true }
        );
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
export default productRouter;
