import request from "supertest";
import app from "../app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("User CRUD API", () => {
  let createdUserId: number;

  it("should create a user", async () => {
    const res = await request(app).post("/users").send({
      name: "John Doe",
      email: "john@example.com",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdUserId = res.body.id;
  });

  it("should get user list with name filter", async () => {
    const res = await request(app).get("/users?name=John");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should get user by ID", async () => {
    const res = await request(app).get(`/users/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "John Doe");
  });

  it("should update the user", async () => {
    const res = await request(app)
      .put(`/users/${createdUserId}`)
      .send({ name: "Jane Doe", email: "jane@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Jane Doe");
  });

  it("should delete the user", async () => {
    const res = await request(app).delete(`/users/${createdUserId}`);
    expect(res.statusCode).toBe(204);
  });

  it("should return 404 for deleted user", async () => {
    const res = await request(app).get(`/users/${createdUserId}`);
    expect(res.statusCode).toBe(404);
  });
});
