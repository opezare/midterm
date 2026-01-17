import { Router } from "express";
import type { Request, Response } from "express";
import { dbPromise } from "../db";

const router = Router();

// GET all rooms
router.get("/", async (_req: Request, res: Response) => {
  const db = await dbPromise;
  const rooms = await db.all("SELECT * FROM HospitalRoom");
  res.json(rooms);
});

// GET room by id
router.get("/:id", async (req: Request, res: Response) => {
  const db = await dbPromise;
  const room = await db.get(
    "SELECT * FROM HospitalRoom WHERE RoomID = ?",
    req.params.id
  );

  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  res.json(room);
});

// POST create room
router.post("/", async (req: Request, res: Response) => {
  const { RoomNumber, Type, Capacity, Status } = req.body;

  const db = await dbPromise;
  const result = await db.run(
    `INSERT INTO HospitalRoom 
     (RoomNumber, Type, Capacity, Status)
     VALUES (?, ?, ?, ?)`,
    RoomNumber,
    Type,
    Capacity,
    Status
  );

  res.status(201).json({
    RoomID: result.lastID,
    RoomNumber,
    Type,
    Capacity,
    Status,
  });
});

// PUT update room
router.put("/:id", async (req: Request, res: Response) => {
  const { RoomNumber, Type, Capacity, Status } = req.body;

  const db = await dbPromise;
  const result = await db.run(
    `UPDATE HospitalRoom 
     SET RoomNumber=?, Type=?, Capacity=?, Status=?
     WHERE RoomID=?`,
    RoomNumber,
    Type,
    Capacity,
    Status,
    req.params.id
  );

  if (result.changes === 0) {
    return res.status(404).json({ message: "Room not found" });
  }

  res.json({ message: "Room updated" });
});

// DELETE room
router.delete("/:id", async (req: Request, res: Response) => {
  const db = await dbPromise;
  const result = await db.run(
    "DELETE FROM HospitalRoom WHERE RoomID = ?",
    req.params.id
  );

  if (result.changes === 0) {
    return res.status(404).json({ message: "Room not found" });
  }

  res.json({ message: "Room deleted" });
});

export default router;
