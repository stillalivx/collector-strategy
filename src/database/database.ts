import { Database, SQLite3Connector } from "../deps.ts";

import Manga from "./models/Manga.ts";

export async function connectDatabase(): Promise<Database> {
  const connector = new SQLite3Connector({ filepath: "./etc/mangaStrategyDatabase.sqlite" });
  const database = new Database(connector);

  database.link([Manga]);

  await database.sync();

  return database;
}

export async function closeDatabase(db: Database): Promise<void> {
  await db.close();
}