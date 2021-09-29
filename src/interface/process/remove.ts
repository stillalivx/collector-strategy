import { Colors, parse } from "../../deps.ts";
import CollectorStrategy from "../../bot/CollectorStrategy.ts";
import { closeDatabase, connectDatabase } from "../../database/database.ts";
import SerieModel from "../../database/models/Serie.ts";

import type { Serie } from "../../types.ts";

async function remove() {
  const args = parse(Deno.args);
  const serieToRemove = parseInt(args.r || args.remove);

  const collectorStrategy = new CollectorStrategy();

  if (isNaN(serieToRemove)) {
    console.log(
      `❌ ${
        Colors.red(
          "No se ha declarado el id de la serie que se desea eliminaar",
        )
      }`,
    );
    return;
  }

  const database = await connectDatabase();
  const serie = await SerieModel.find(serieToRemove) as unknown as Serie;

  if (!serie) {
    console.log(
      `❌ ${Colors.red("La serie con el id " + serieToRemove + " no existe")}`,
    );
    return;
  }

  console.log(`📝 ${Colors.green("Actualizando lista...")}`);

  await collectorStrategy.deleteFromTrelloList(serie);

  console.log(`📝 ${Colors.green("Lista actualizada...")}`);
  console.log(`🚮 ${Colors.green("Eliminando serie...")}`);

  await SerieModel.deleteById(serieToRemove);
  await closeDatabase(database);

  console.log(`✔️ ${Colors.green("Serie eliminada...")}`);
}

export default remove;
