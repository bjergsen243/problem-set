import { PrismaClient } from "@prisma/client";
import express from "express";

const router = express.Router();
const prisma = new PrismaClient();

// Create user
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// List users (with basic filter: name)
router.get("/", async (req, res) => {
  const { name } = req.query;
  const users = await prisma.user.findMany({
    where: name ? { name: { contains: String(name) } } : undefined,
  });
  res.json(users);
});

// Get user by ID
router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (user) return res.json(user);
  res.status(404).json({ error: "User not found" });
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const updated = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { name, email },
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "User not found or invalid data" });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;
