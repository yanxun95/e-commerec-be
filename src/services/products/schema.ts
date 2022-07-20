import { compare } from "bcrypt";
import { Schema, model, ObjectId, Types } from "mongoose";

export interface IProduct {
  _id?: ObjectId;
  name?: string;
  price?: string;
  brand?: string;
  image?: string;
  description?: string;
  quantity?: string;
  comment?: Array<ObjectId>;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    brand: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: String, required: true },
    comment: { type: Schema.Types.ObjectId, ref: "comment" },
  },
  {
    timestamps: true,
  }
);

productSchema.methods.toJSON = function () {
  const productDocument = this;
  const productObject = productDocument.toObject();
  delete productObject.__v;
  if (Object.keys(productObject).length > 10) {
    delete productObject.comment.__v;
    delete productObject.comment.updateAt;
  }
  return productObject;
};

export default model<IProduct>("product", productSchema);
