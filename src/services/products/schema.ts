import { Schema, model, ObjectId, Types } from "mongoose";

export interface IProduct {
  _id?: ObjectId;
  name?: string;
  price?: string;
  brand?: string;
  image?: string;
  description?: string;
  quantity?: string;
  userId?: Types.ObjectId;
  comment?: Array<string>;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    brand: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: String, required: true },
    comment: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  {
    timestamps: true,
  }
);

productSchema.methods.toJSON = function () {
  const productDocument = this;
  const productObject = productDocument.toObject();
  delete productObject.__v;

  return productObject;
};

export default model<IProduct>("product", productSchema);
