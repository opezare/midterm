import { Router } from "express";
import type { Request, Response } from "express";
import { dbPromise } from "../db";

const router = Router();

// GET all users
router.get("/", async (_req, res) => {
  const db = await dbPromise;
  const users = await db.all(`
    SELECT Users.UserID, Username, RoleName
    FROM Users
    LEFT JOIN Roles ON Users.RoleID = Roles.RoleID
  `);
  res.json(users);
});

// POST user
router.post("/", async (req, res) => {
  const { Username, RoleID } = req.body;
  const db = await dbPromise;

  const result = await db.run(
    "INSERT INTO Users (Username, RoleID) VALUES (?, ?)",
    Username,
    RoleID
  );

  res.status(201).json({
    UserID: result.lastID,
    Username,
    RoleID,
  });
});

export default router;
