import createHttpError from "http-errors";
import jwt, { Secret } from "jsonwebtoken";
import { IUser } from "../services/users/schema";
import UserModel from "../services/users/schema";
import { Response, Request, NextFunction } from "express";

interface IDecodedToken {
  _id: string;
  iat: number;
  exp: number;
}
export const JWTAuthenticate = async (user: IUser) => {
  // given the user the function gives us back the access token
  const accessToken = await generateJWT({ _id: user._id });
  return accessToken;
};

const generateJWT = (payload: object) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET as Secret,
      { expiresIn: "30 days" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

const verifyJWT = (token: string) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET as string, (err, decodedToken) => {
      if (err) rej(err);
      else res(decodedToken);
    })
  );

export const JWTAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(401, "Please provide credentials in Authorization header")
    );
  } else {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = (await verifyJWT(token)) as IDecodedToken;
      const user = await UserModel.findById(decodedToken._id);
      if (user) {
        // req.user = user;
        next();
      } else {
        next(createHttpError(404, "User not found!"));
      }
    } catch (error) {
      next(createHttpError(403, "Forbidden!"));
    }
  }
};
