import { Database, SQLite3Connector, dirname } from "../deps.ts";

import SerieModel from "./models/Serie.ts";

export async function connectDatabase(): Promise<Database> {
  const connector = new SQLite3Connector({
    filepath: `${dirname(Deno.execPath())}/etc/collection.sqlite`,
  });
  const database = new Database(connector);

  database.link([SerieModel]);

  await database.sync();

  return database;
}

export async function closeDatabase(db: Database): Promise<void> {
  await db.close();
}
