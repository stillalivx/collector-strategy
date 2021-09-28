import { Colors, parse } from "../../deps.ts";
import { getTrelloEnv } from "../../utils/getEnv.ts";
import { connectDatabase, closeDatabase } from "../../database/database.ts";
import Manga from "../../database/models/Manga.ts";
import Panini from "../../scrapping/Panini.js";
import MangaStrategy from "../../bot/MangaStrategy.ts";

import type { EnumStore, Store } from "../../types.ts";

async function add() {
  const args = parse(Deno.args);
  const tomeName = args.a || args.add;
  const { TRELLO_KEY, TRELLO_TOKEN } = getTrelloEnv();
  const mangaStrategy = new MangaStrategy(TRELLO_KEY, TRELLO_TOKEN);
  

  let store = args.s || args.store;
  let storeName;
  let storeScrapping: Store;
  let storeEnumValue: EnumStore;

  if (!tomeName || typeof tomeName !== "string") {
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

  console.log(Colors.green(`🔍 Buscando "${tomeName}" en ${storeName}`));

  const searchResults = await storeScrapping.search(tomeName);

  if (!searchResults.length) {
    console.log(`❌ ${Colors.red("No se han encontrado resultados")}`);
    return;
  }

  console.log(Colors.green(`🔍 Resultados:\n`));

  searchResults.forEach((manga, index) => {
    console.log(
      `${Colors.blue(`${index}.`)} ${Colors.yellow(manga.serie as string)} ${
        manga.description
          ? Colors.gray("- ") + Colors.cyan(manga.description as string)
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

  const userLastTome = parseInt(
    prompt(Colors.blue("Último tomo adquirido:"), "") as string,
  );

  if (isNaN(userLastTome)) {
    return;
  }

  console.log(`\n🔍 ${Colors.green("Obteniendo datos adicionales...")}`);

  const seriePage = await storeScrapping.getSerieURL(
    searchResults[userSerieChoice].url as string,
  );

  console.log(`💾 ${Colors.green("Guardando la información...")}`);

  const database = await connectDatabase();

  const serieExists = await Manga.select("id").where({
    page: seriePage,
  }).first();

  if (serieExists) {
    console.log(`❌ ${Colors.red("La serie ya ha sido registrada")}`);
    return;
  }

  const manga = {
    name: searchResults[userSerieChoice].serie as string,
    lastTome: userLastTome,
    page: seriePage,
    store: storeEnumValue,
    lastCheck: new Date(),
  };

  const dbResponse = await Manga.create(manga);

  console.log(`💾 ${Colors.green("La serie se guardó con éxito...")}`);
  console.log(`📝 ${Colors.green("Actualizando lista...")}`);

  const nextMangas = await mangaStrategy.getNextSeries([manga]);

  if (nextMangas.length) {
    await Manga
      .where({ id: dbResponse.lastInsertId as number })
      .update({
        lastTome: nextMangas[nextMangas.length - 1].tome as number,
        lastCheck: new Date(),
      });
      
    await mangaStrategy.sortMangaList(nextMangas);
  }

  await closeDatabase(database);

  console.log(`✔️ ${Colors.green("Lista actualizada...")}`);
}

export default add;