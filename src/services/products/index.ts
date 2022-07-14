import express, { Response, Request, NextFunction } from "express";
import ProductModel, { IProduct } from "./schema";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import createHttpError from "http-errors";
import multer from "multer";
import { JWTAuthMiddleware } from "../../auth/tools";
import { deleteImg } from "../function";

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
      const deletedProduct = await ProductModel.findByIdAndDelete(productId);

      if (deletedProduct) {
        res.status(204).send();
        await deleteImg(deletedProduct.image as string);
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
