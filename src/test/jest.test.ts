import supertest from "supertest";
import app from "../app";
import {
  connectDBForTesting,
  disconnectDBForTesting,
} from "./connectDBForTesting";
import userSchema, { IUser } from "../services/users/schema";
import productSchema from "../services/products/schema";
import commentSchema, { IComment } from "../services/comments/schema";
import { faker } from "@faker-js/faker";
import { deleteImg, convertUrl } from "../services/function";
import mongoose from "mongoose";

let token: string,
  userId: string,
  productId: string,
  commentId: string,
  userUrl: string,
  productUrl: string;
const productImagePath = __dirname + "/macbook-air-midnight.jpg";
const userImagePath = __dirname + "/face_co_rmc4ey.png";

const request = supertest(app);
beforeAll(async () => {
  await connectDBForTesting();
});

describe("Create testing", () => {
  const userDetails: IUser = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    password: "testPassword123",
    email: "testEmail@gmail.com",
    address: faker.address.cityName(),
    image: faker.image.avatar(),
    googleId: faker.database.mongodbObjectId(),
  };

  it("new user", async () => {
    const response = await request.post("/user/register").send(userDetails);
    userUrl = convertUrl("user", response.text);
    userId = response.text
      .split("")
      .filter((word) => word !== '"')
      .join("");
    expect(response.status).toBe(201);
  });

  const userLogin = {
    email: "testEmail@gmail.com",
    password: "testPassword123",
  };

  it("user login", async () => {
    const response = await request.post("/user/login").send(userLogin);
    token = response.text;
    expect(response.status).toBe(200);
    expect(typeof token).toBe("string");
  });

  it("post picture", async () => {
    const newUrl = `/user/userImage`;
    const response = await request
      .post(newUrl)
      .auth(token, { type: "bearer" })
      .attach("userImg", userImagePath);
    expect(response.status).toBe(201);
  });

  it("new product", async () => {
    const response = await request
      .post("/product/newProduct")
      .auth(token, { type: "bearer" })
      .field("name", "Iphone 12")
      .field("price", "850")
      .field("brand", "Apple")
      .field("description", "Product description")
      .field("quantity", "100")
      .field("userId", userId)
      .attach("image", productImagePath);
    productUrl = convertUrl("product", response.text);
    productId = response.text;
    expect(response.status).toBe(201);
  });

  const commentDetails: IComment = {
    comment: faker.lorem.sentences(),
    productId: new mongoose.Types.ObjectId(productId),
  };

  it("new comment", async () => {
    const response = await request
      .post("/product/comment")
      .auth(token, { type: "bearer" })
      .send(commentDetails);
    commentId = response.text;
    expect(response.status).toBe(201);
  });
});

describe("Edit testing", () => {
  const editUser: IUser = {
    firstName: faker.name.firstName(),
  };

  it("edit user", async () => {
    const response = await request
      .put("/user/")
      .auth(token, { type: "bearer" })
      .send(editUser);
    expect(response.status).toBe(200);
  });

  it("edit picture", async () => {
    const newUrl = `/user/userImage`;
    const response = await request
      .put(newUrl)
      .auth(token, { type: "bearer" })
      .attach("userImg", userImagePath);
    let imageId = response.text;
    await deleteImg(imageId);
    expect(response.status).toBe(201);
  });

  it("edit product", async () => {
    const response = await request
      .put(productUrl)
      .auth(token, { type: "bearer" })
      .field("name", "Iphone 12")
      .field("price", "850")
      .field("brand", "Apple")
      .field("description", "Product description")
      .field("quantity", "99")
      .attach("image", productImagePath);
    expect(response.status).toBe(200);
  });

  const editCommentDetails: IComment = {
    comment: faker.lorem.sentences(),
  };

  it("edit comment", async () => {
    let editCommentUrl = convertUrl("comment", commentId);
    const response = await request
      .put(`/product${editCommentUrl}`)
      .auth(token, { type: "bearer" })
      .send(editCommentDetails);
    expect(response.status).toBe(201);
  });
});

describe("Get testing", () => {
  it("get all user", async () => {
    const response = await request.get("/user");
    expect(response.status).toBe(200);
  });

  it("get user by id", async () => {
    const response = await request.get(userUrl);
    expect(response.status).toBe(200);
  });

  it("get all product", async () => {
    const response = await request.get("/product");
    expect(response.status).toBe(200);
  });

  it("get product by id", async () => {
    const response = await request.get(productUrl);
    expect(response.status).toBe(200);
  });
});

describe("delete testing", () => {
  it("delete product by id", async () => {
    const response = await request
      .delete(productUrl)
      .auth(token, { type: "bearer" })
      .field("userId", userId);
    expect(response.status).toBe(204);
  });

  it("delete comment", async () => {
    let editCommentUrl = convertUrl("comment", commentId);
    const response = await request
      .delete(`/product${editCommentUrl}`)
      .auth(token, { type: "bearer" });
    expect(response.status).toBe(204);
  });
});

afterAll(async () => {
  await userSchema.collection.drop();
  await productSchema.collection.drop();
  await commentSchema.collection.drop();
  await disconnectDBForTesting();
});
