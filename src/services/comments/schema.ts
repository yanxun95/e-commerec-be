import { Schema, model, ObjectId, Types } from "mongoose";

export interface IComment {
  _id?: ObjectId;
  userId?: Types.ObjectId;
  productId?: Types.ObjectId;
  comment: string;
}

const commentSchema = new Schema<IComment>(
  {
    comment: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "product", required: true },
  },
  {
    timestamps: true,
  }
);

commentSchema.methods.toJSON = function () {
  const commentDocument = this;
  const commentObject = commentDocument.toObject();
  delete commentObject.__v;

  return commentObject;
};

export default model<IComment>("comment", commentSchema);
