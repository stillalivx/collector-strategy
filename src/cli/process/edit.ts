import { Colors, parse } from "../../deps.ts";
import CollectorStrategy from "../../bot/CollectorStrategy.ts";
import SerieModel from "../../database/models/Serie.ts";
import Panini from "../../scraping/Panini.ts";
import { getUserConfig } from "../../utils/userConfig.ts";
import InterfaceError from "../../utils/InterfaceError.ts";

import type { Product, Serie } from "../../types.ts";

async function edit() {
  const args = parse(Deno.args);
  const serieToEdit = parseInt(args._[1] as string);
  const userConfig = getUserConfig();

  if (!userConfig.trello.list) {
    throw new InterfaceError(
      "No se ha registrado la lista de trello para organizar la colección",
    );
  }

  const collectorStrategy = new CollectorStrategy(userConfig.trello.list);

  if (isNaN(serieToEdit)) {
    throw new InterfaceError(
      "No se ha declarado el id de la serie que se desea editar",
    );
  }

  const serie = await SerieModel.find(serieToEdit) as unknown as Serie;

  if (!serie) {
    throw new InterfaceError(
      "La serie con el id " + serieToEdit + " no existe",
    );
  }

  const storeScrapping = new Panini();

  console.log(`${Colors.yellow("Actualizando " + serie.name + "...")}\n`);
  const userSerieLastNumber = parseInt(
    prompt(
      `${Colors.blue("> Último tomo adquirido")} ${
        Colors.gray("(" + serie.lastNumber + ")")
      }:`,
      "",
    ) as string,
  );

  if (isNaN(userSerieLastNumber)) {
    return;
  }

  serie.lastNumber = userSerieLastNumber;

  console.log(`\n${Colors.green("+ Guardando la información...")}`);

  await SerieModel
    .where({ id: serieToEdit })
    .update({ lastNumber: userSerieLastNumber });

  console.log(`${Colors.green("+ La serie se guardó con éxito...")}`);
  console.log(`${Colors.green("+ Actualizando lista...")}`);

  const newProductsPublished = await storeScrapping.getNewProducts(
    serie,
  ) as unknown as Product[];

  if (newProductsPublished.length) {
    await SerieModel
      .where({ id: serieToEdit })
      .update({
        lastNumber:
          newProductsPublished[newProductsPublished.length - 1].number,
        lastCheck: new Date(),
      });

    await collectorStrategy.deleteFromTrelloList(serie);
    await collectorStrategy.updateTrelloList(newProductsPublished);
  }

  console.log(`${Colors.green("+ Lista actualizada...")}`);
}

export default edit;
