import { Router } from "express";
import type { Request, Response } from "express";
import { dbPromise } from "../db";

const router = Router();

// GET all roles
router.get("/", async (_req: Request, res: Response) => {
  const db = await dbPromise;
  const roles = await db.all("SELECT * FROM Roles");
  res.json(roles);
});

// POST role
router.post("/", async (req: Request, res: Response) => {
  const { RoleName } = req.body;
  const db = await dbPromise;

  const result = await db.run(
    "INSERT INTO Roles (RoleName) VALUES (?)",
    RoleName
  );

  res.status(201).json({
    RoleID: result.lastID,
    RoleName,
  });
});

export default router;
