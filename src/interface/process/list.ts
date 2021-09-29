import { Colors } from "../../deps.ts";
import { connectDatabase, closeDatabase } from "../../database/database.ts";

import SerieModel from "../../database/models/Serie.ts";

async function list() {
  console.log(`💾 ${Colors.green("Obteniendo las series enlistadas...\n")}`);

  const database = await connectDatabase();
  const series = await SerieModel.all();

  await closeDatabase(database);

  console.log(series);
}

export default list;
