import supertest from "supertest";
import app from "../app";
import {
  connectDBForTesting,
  disconnectDBForTesting,
} from "./connectDBForTesting";
import userSchema, { IUser } from "../services/users/schema";
import productSchema from "../services/products/schema";
import { faker } from "@faker-js/faker";
import { v2 as cloudinary } from "cloudinary";
import { IProduct } from "../services/products/schema";
import { deleteImg, convertUrl } from "../services/function";

let token: string;
let userId: string;

const request = supertest(app);
beforeAll(async () => {
  await connectDBForTesting();
});

describe("User testing", () => {
  it("get all user", async () => {
    const response = await request.get("/user");
    expect(response.status).toBe(200);
  });

  const userDetails: IUser = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    dob: "21/3/2000",
    password: "testPassword123",
    gender: faker.name.gender(),
    email: "testEmail@gmail.com",
    address: faker.address.cityName(),
    image: faker.image.avatar(),
    googleId: faker.database.mongodbObjectId(),
  };

  let userUrl: string;

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

  it("get user by id", async () => {
    const response = await request.get(userUrl);
    expect(response.status).toBe(200);
  });

  it("user login", async () => {
    const response = await request.post("/user/login").send(userLogin);
    token = response.text;
    expect(response.status).toBe(200);
    expect(typeof token).toBe("string");
  });

  const editUser: IUser = {
    dob: "25/5/2000",
  };

  it("edit user", async () => {
    const response = await request
      .put(userUrl)
      .auth(token, { type: "bearer" })
      .send(editUser);
    expect(response.status).toBe(200);
  });

  const imgPath = __dirname + "/face_co_rmc4ey.png";

  it("post picture", async () => {
    const newUrl = `${userUrl}/userImage`;
    const response = await request
      .post(newUrl)
      .auth(token, { type: "bearer" })
      .attach("userImg", imgPath);
    expect(response.status).toBe(201);
  });

  it("edit picture", async () => {
    const newUrl = `${userUrl}/userImage`;
    const response = await request
      .put(newUrl)
      .auth(token, { type: "bearer" })
      .attach("userImg", imgPath);
    let imageId = response.text.split(",")[7];
    await deleteImg(imageId);
    expect(response.status).toBe(201);
  });
});

describe("Product testing", () => {
  it("get all product", async () => {
    const response = await request.get("/product");
    expect(response.status).toBe(200);
  });

  let productUrl: string;
  const imgPath = __dirname + "/macbook-air-midnight.jpg";

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
      .attach("image", imgPath);
    productUrl = convertUrl("product", response.text);
    expect(response.status).toBe(201);
  });

  it("get product by id", async () => {
    const response = await request.get(productUrl);
    expect(response.status).toBe(200);
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
      .attach("image", imgPath);
    expect(response.status).toBe(200);
  });

  it("delete product by id", async () => {
    const response = await request
      .delete(productUrl)
      .auth(token, { type: "bearer" });
    expect(response.status).toBe(204);
  });
});

afterAll(async () => {
  await userSchema.collection.drop();
  await productSchema.collection.drop();
  await disconnectDBForTesting();
});
