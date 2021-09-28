import { Colors, parse } from "../../deps.ts";
import { getTrelloEnv } from "../../utils/getEnv.ts";
import { closeDatabase, connectDatabase } from "../../database/database.ts";
import SerieModel from "../../database/models/Serie.ts";
import Panini from "../../scrapping/Panini.js";
import CollectorStrategy from "../../bot/CollectorStrategy.ts";

import type { EnumStore, Store } from "../../types.ts";

async function add() {
  const args = parse(Deno.args);
  const searchValue = args.a || args.add;
  const { TRELLO_KEY, TRELLO_TOKEN } = getTrelloEnv();
  const collectorStrategy = new CollectorStrategy(TRELLO_KEY, TRELLO_TOKEN);

  let store = args.s || args.store;
  let storeName;
  let storeScrapping: Store;
  let storeEnumValue: EnumStore;

  if (!searchValue || typeof searchValue !== "string") {
    console.log(`❌ ${Colors.red("No se ha declarado el nombre de la serie")}`);
    return;
  }

  if (!store || typeof store !== "string") {
    console.log(
      `❌ ${
        Colors.red(
          "No se ha declarado la tienda en la que se buscará el producto",
        )
      }`,
    );
    return;
  }

  if (store === "panini" || store === "p") {
    storeScrapping = new Panini() as unknown as Store;
    storeEnumValue = "panini";
    storeName = "Editorial Panini";
  } else {
    console.log(`❌ ${Colors.red("La tienda declarada es invalida")}`);
    return;
  }

  console.log(Colors.green(`🔍 Buscando "${searchValue}" en ${storeName}`));

  const searchResults = await storeScrapping.search(searchValue);

  if (!searchResults.length) {
    console.log(`❌ ${Colors.red("No se han encontrado resultados")}`);
    return;
  }

  console.log(Colors.green(`🔍 Resultados:\n`));

  searchResults.forEach((product, index) => {
    console.log(
      `${Colors.blue(`${index}.`)} ${Colors.yellow(product.name as string)} ${
        product.description
          ? Colors.gray("- ") + Colors.cyan(product.description as string)
          : ""
      }`,
    );
  });

  const userSerieChoice = parseInt(
    prompt(`\n${Colors.blue("Escoger serie:")}`, "") as string,
  );

  if (isNaN(userSerieChoice)) {
    return;
  }

  const userSerieLastNumber = parseInt(
    prompt(Colors.blue("Último número adquirido:"), "") as string,
  );

  if (isNaN(userLastNumber)) {
    return;
  }

  console.log(`\n🔍 ${Colors.green("Obteniendo datos adicionales...")}`);

  const serieUrl = await storeScrapping.getProductUrlSerie(
    searchResults[userSerieChoice].url as string,
  );

  console.log(`💾 ${Colors.green("Guardando la información...")}`);

  const database = await connectDatabase();

  const serieExists = await SerieModel.select("id").where({
    url: serieUrl,
  }).first();

  if (serieExists) {
    console.log(`❌ ${Colors.red("La serie ya ha sido registrada")}`);
    return;
  }

  const serie = {
    name: searchResults[userSerieChoice].name,
    description: searchResults[userSerieChoice].description,
    lastNumber: userSerieLastNumber,
    url: serieUrl,
    store: storeEnumValue,
    lastCheck: new Date(),
  };

  const dbResponse = await SerieModel.create(serie);

  console.log(`💾 ${Colors.green("La serie se guardó con éxito...")}`);
  console.log(`📝 ${Colors.green("Actualizando lista...")}`);

  const newProductsPublished = await mangaStrategy.getNextSeries([product]);

  if (nextMangas.length) {
    await ProductModel
      .where({ id: dbResponse.lastInsertId as number })
      .update({
        lastNumber: nextMangas[nextMangas.length - 1].tome as number,
        lastCheck: new Date(),
      });

    await mangaStrategy.sortMangaList(nextMangas);
  }

  await closeDatabase(database);

  console.log(`✔️ ${Colors.green("Lista actualizada...")}`);
}

export default add;
