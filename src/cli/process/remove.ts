import { Colors, parse } from "../../deps.ts";
import CollectorStrategy from "../../bot/CollectorStrategy.ts";
import SerieModel from "../../database/models/Serie.ts";
import { getUserConfig } from "../../utils/userConfig.ts";
import InterfaceError from "../../utils/InterfaceError.ts";

import type { Serie } from "../../types.ts";

async function remove() {
  const args = parse(Deno.args);
  const serieToRemove = parseInt(args._[1] as string);
  const userConfig = getUserConfig();

  if (!userConfig.trello.list) {
    throw new InterfaceError(
      "No se ha registrado la lista de trello para organizar la colección",
    );
  }

  const collectorStrategy = new CollectorStrategy(userConfig.trello.list);

  if (isNaN(serieToRemove)) {
    throw new InterfaceError(
      "No se ha declarado el id de la serie que se desea eliminaar",
    );
  }

  const serie = await SerieModel.find(serieToRemove) as unknown as Serie;

  if (!serie) {
    throw new InterfaceError(
      "La serie con el id " + serieToRemove + " no existe",
    );
  }

  console.log(`${Colors.green("+ Actualizando lista...")}`);

  await collectorStrategy.deleteFromTrelloList(serie);
  await collectorStrategy.updateTrelloList([]);

  console.log(`${Colors.green("+ Lista actualizada...")}`);
  console.log(`${Colors.green("+ Eliminando serie...")}`);

  await SerieModel.deleteById(serieToRemove);

  console.log(`${Colors.green("+ Serie eliminada...")}`);
}

export default remove;
