import { Colors, Database, SQLite3Connector } from "../../deps.ts";

import SerieModel from "../../database/models/Serie.ts";

async function list() {
  console.log(`💾 ${Colors.green("Obteniendo las series enlistadas...\n")}`);

  const connector = new SQLite3Connector({
    filepath: "./etc/mangaStrategyDatabase.sqlite",
  });
  const db = new Database(connector);

  db.link([SerieModel]);

  await db.sync();

  const series = await SerieModel.all();

  await db.close();

  console.log(series);
}

export default list;
