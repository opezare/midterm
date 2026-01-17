import express from "express";
import { dbPromise } from "./db";

import usersRouter from "./users";
import rolesRouter from "./roles";
import roomsRouter from "./rooms";

const app = express();
app.use(express.json());

(async () => {
  const db = await dbPromise;

  // USERS
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      UserID INTEGER PRIMARY KEY AUTOINCREMENT,
      Username TEXT NOT NULL,
      RoleID INTEGER
    )
  `);

  // ROLES
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Roles (
      RoleID INTEGER PRIMARY KEY AUTOINCREMENT,
      RoleName TEXT NOT NULL
    )
  `);

  // HOSPITAL ROOMS
  await db.exec(`
    CREATE TABLE IF NOT EXISTS HospitalRoom (
      RoomID INTEGER PRIMARY KEY AUTOINCREMENT,
      RoomNumber TEXT NOT NULL,
      Type TEXT NOT NULL,
      Capacity INTEGER NOT NULL,
      Status TEXT NOT NULL
    )
  `);
})();

// routes
app.use("/users", usersRouter);
app.use("/roles", rolesRouter);
app.use("/rooms", roomsRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
