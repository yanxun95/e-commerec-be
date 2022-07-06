import supertest from "supertest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "../app";
import { MongoClient } from "mongodb";
import {
  connectDBForTesting,
  disconnectDBForTesting,
} from "./connectDBForTesting";
import userSchema, { IUser } from "../services/users/schema";
import { faker } from "@faker-js/faker";

const request = supertest(app);

describe("Testing the testing environment", () => {
  it("should test that true is true", () => {
    expect(true).toBe(true);
  });
});

describe("personModel Testing", () => {
  beforeAll(async () => {
    await connectDBForTesting();
  });

  afterAll(async () => {
    await userSchema.collection.drop();
    await disconnectDBForTesting();
  });

  it("get all user", async () => {
    const response = await request.get("/user");
    expect(response.status).toBe(200);
  });

  const userDetails: IUser = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    dob: faker.date.birthdate({
      min: 18,
      max: 80,
      mode: "age",
    }) as unknown as string,
    password: faker.internet.password(5),
    gender: faker.name.gender(),
    email: faker.internet.email(),
    address: faker.address.cityName(),
    image: faker.image.avatar(),
    googleId: faker.database.mongodbObjectId(),
  };

  it("register new user", async () => {
    const response = await request.post("/user/register").send(userDetails);
    expect(response.status).toBe(201);
    // expect(response.body.messge).toBe({=});
  });
});
