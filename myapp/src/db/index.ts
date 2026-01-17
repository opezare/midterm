import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const dbPromise = open({
  filename: "app.db",
  driver: sqlite3.Database,
});
