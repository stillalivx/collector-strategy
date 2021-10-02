import { Colors, parse } from "../../deps.ts";
import CollectorStrategy from "../../bot/CollectorStrategy.ts";
import { closeDatabase, connectDatabase } from "../../database/database.ts";
import SerieModel from "../../database/models/Serie.ts";
import Panini from "../../scraping/Panini.js";

import type { Serie, Product } from "../../types.ts";

async function edit() {
  const args = parse(Deno.args);
  const serieToEdit = parseInt(args.e || args.edit);

  const collectorStrategy = new CollectorStrategy();

  if (isNaN(serieToEdit)) {
    console.log(
      `❌ ${
        Colors.red(
          "No se ha declarado el id de la serie que se desea editar",
        )
      }`,
    );
    return;
  }

  const database = await connectDatabase();
  const serie = await SerieModel.find(serieToEdit) as unknown as Serie;

  if (!serie) {
    console.log(
      `❌ ${Colors.red("La serie con el id " + serieToEdit + " no existe")}`,
    );
    return;
  }

  const storeScrapping = new Panini();

  console.log(`${Colors.yellow("Actualizando " + serie.name + "...")}\n`);
  const userSerieLastNumber = parseInt(prompt(`${Colors.blue("Último tomo adquirido")} ${Colors.gray("(" + serie.lastNumber + ")")}:`, "") as string);

  if (isNaN(userSerieLastNumber)) {
    return;
  }

  serie.lastNumber = userSerieLastNumber;

  console.log(`\n💾 ${Colors.green("Guardando la información...")}`);

  await SerieModel
    .where({ id: serieToEdit })
    .update({ lastNumber: userSerieLastNumber });

  console.log(`💾 ${Colors.green("La serie se guardó con éxito...")}`);
  console.log(`📝 ${Colors.green("Actualizando lista...")}`);

  const newProductsPublished = await storeScrapping.getNewSerieProducts(serie) as unknown as Product[];

  if (newProductsPublished.length) {
    await SerieModel
      .where({ id: serieToEdit })
      .update({
        lastNumber:
          newProductsPublished[newProductsPublished.length - 1].number,
        lastCheck: new Date(),
      });

    await collectorStrategy.updateTrelloList(newProductsPublished);
  }

  console.log(`✔️ ${Colors.green("Lista actualizada...")}`);

  await closeDatabase(database);
}

export default edit;