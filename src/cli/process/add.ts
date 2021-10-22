import { Colors, parse } from "../../deps.ts";
import SerieModel from "../../database/models/Serie.ts";
import Panini from "../../scraping/Panini.ts";
import CollectorStrategy from "../../bot/CollectorStrategy.ts";
import { getUserConfig } from "../../utils/userConfig.ts";
import InterfaceError from "../../utils/InterfaceError.ts";

import type { EnumStore, Store } from "../../types.ts";

async function add() {
  const args = parse(Deno.args);
  const searchValue = args._[1];
  const userConfig = getUserConfig();

  if (!userConfig.trello.list) {
    throw new InterfaceError(
      "No se ha registrado la lista de trello para organizar la colección",
    );
  }

  const collectorStrategy = new CollectorStrategy(userConfig.trello.list);

  let store = args.s || args.store;
  let storeName;
  let storeScrapping: Store;
  let storeEnumValue: EnumStore;

  if (!searchValue || typeof searchValue !== "string") {
    throw new InterfaceError("No se ha declarado el nombre de la serie");
  }

  if (!store || typeof store !== "string") {
    throw new InterfaceError(
      "No se ha declarado la tienda en la que se buscará el producto",
    );
  }

  if (store === "panini" || store === "p") {
    storeScrapping = new Panini();
    storeEnumValue = "panini";
    storeName = "Editorial Panini";
  } else {
    throw new InterfaceError("La tienda declarada es invalida");
  }

  console.log(Colors.green(`- Buscando "${searchValue}" en ${storeName}`));

  const searchResults = await storeScrapping.search(searchValue);

  if (!searchResults.length) {
    throw new InterfaceError("No se han encontrado resultados");
  }

  console.log(Colors.green(`- Resultados:\n`));

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
    prompt(`\n${Colors.blue("> Escoger serie:")}`, "") as string,
  );

  if (isNaN(userSerieChoice)) {
    return;
  }

  const userSerieLastNumber = parseInt(
    prompt(Colors.blue("> Último número adquirido:"), "") as string,
  );

  if (isNaN(userSerieLastNumber)) {
    return;
  }

  console.log(`\n${Colors.green("+ Obteniendo datos adicionales...")}`);

  const serieUrl = await storeScrapping.getProductUrlSerie(
    searchResults[userSerieChoice].url,
  );

  console.log(`${Colors.green("+ Guardando la información...")}`);

  const serieExists = await SerieModel.select("id").where({
    name: searchResults[userSerieChoice].name,
    description: searchResults[userSerieChoice].description,
    url: serieUrl,
  }).first();

  if (serieExists) {
    throw new InterfaceError("La serie ya ha sido registrada");
  }

  const serie = {
    name: searchResults[userSerieChoice].name,
    description: searchResults[userSerieChoice].description,
    lastNumber: userSerieLastNumber,
    url: serieUrl,
    store: storeEnumValue,
    lastCheck: new Date(),
  };

  const dbResponse = await SerieModel.add(serie);

  console.log(`${Colors.green("+ La serie se guardó con éxito...")}`);
  console.log(`${Colors.green("+ Actualizando lista...")}`);

  const newProductsPublished = await storeScrapping.getNewProducts({
    id: dbResponse.lastInsertId,
    ...serie,
  });

  if (newProductsPublished.length) {
    await SerieModel.updateLastNumber(
      dbResponse.lastInsertId,
      newProductsPublished[newProductsPublished.length - 1].number,
    );

    await collectorStrategy.updateTrelloList(newProductsPublished);
  }

  console.log(`✔️ ${Colors.green("Lista actualizada...")}`);
}

export default add;
