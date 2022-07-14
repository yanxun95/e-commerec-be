import supertest from "supertest";
import app from "../app";
import {
  connectDBForTesting,
  disconnectDBForTesting,
} from "./connectDBForTesting";
import userSchema, { IUser } from "../services/users/schema";
import { faker } from "@faker-js/faker";
import { v2 as cloudinary } from "cloudinary";

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

  let userId: string;

  it("register new user", async () => {
    const response = await request.post("/user/register").send(userDetails);
    userId = response.text;
    expect(response.status).toBe(201);
  });

  const userLogin = {
    email: "testEmail@gmail.com",
    password: "testPassword123",
  };

  let token: string;

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
    const url = `/user/${userId}`;
    const newUrl = url
      .split("")
      .filter((word) => word !== '"')
      .join("");
    const response = await request
      .put(newUrl)
      .auth(token, { type: "bearer" })
      .send(editUser);
    expect(response.status).toBe(200);
  });

  const testImage = Buffer.from("face_co_rmc4ey.png");
  const imgPath = __dirname + "/face_co_rmc4ey.png";

  it("post picture", async () => {
    const url = `/user/${userId}/userImage`;
    const newUrl = url
      .split("")
      .filter((word) => word !== '"')
      .join("");
    const response = await request
      .post(newUrl)
      .auth(token, { type: "bearer" })
      // .set("content-type", "application/octet-stream")
      .attach("userImg", imgPath);
    let imageId = response.text
      .split(",")[7]
      .split("/")
      .slice(7, 10)
      .join("/")
      .split(".")[0] as string;
    await cloudinary.uploader.destroy(imageId);
    expect(response.status).toBe(201);
  });
});

afterAll(async () => {
  await userSchema.collection.drop();
  await disconnectDBForTesting();
});
