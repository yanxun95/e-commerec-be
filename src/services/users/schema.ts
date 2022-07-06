import mongoose, { Schema, model, Model, ObjectId } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  _id?: ObjectId;
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

interface UserModel extends Model<IUser> {
  checkCredentials(email: string, plainPW: string): IUser | null;
}

const userSchema = new Schema<IUser, UserModel>(
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

userSchema.static(
  "checkCredentials",
  async function checkCredentials(email, plainPW) {
    const user = await this.findOne({ email });

    if (user) {
      const isMatch = await bcrypt.compare(plainPW, user.password);
      if (isMatch) return user;
      else return null; // if the pw is not ok I'm returning null
    } else return null; // if the email is not ok I'm returning null as well
  }
);
export default model<IUser, UserModel>("user", userSchema);
