import mongoose, { InferSchemaType } from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

export interface IUser {
  firstName: string;
  lastName: string;
  dob: string;
  password: string;
  gender: string;
  email: string;
  address: string;
  image: string;
  googleId: string;
}

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dobdsx6ge/image/upload/v1644180026/MySpaceUser/userimageplaceholder_nrutpa.jpg",
    },
    googleId: String,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const newUser = this;
  const plainPW = newUser.password;

  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

userSchema.methods.toJSON = function () {
  const userDocument = this;
  const userObject = userDocument.toObject();
  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

type User = InferSchemaType<typeof userSchema>;

export default model("user", userSchema);
