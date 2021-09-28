import { Colors, Database, SQLite3Connector } from "../../deps.ts";

import Manga from "../../database/models/Manga.ts";

async function list() {
  console.log(`💾 ${Colors.green("Obteniendo las series enlistadas...\n")}`);

  const connector = new SQLite3Connector({ filepath: "./etc/mangaStrategyDatabase.sqlite" });
  const db = new Database(connector);

  db.link([Manga]);

  await db.sync();

  const mangas = await Manga.all();

  await db.close();

  console.log(mangas);
}

export default list;
