import { osNotify, Colors } from "../../deps.ts";
import SerieModel from "../../database/models/Serie.ts";
import CollectorStrategy from "../../bot/CollectorStrategy.ts";
import InterfaceError from "../../utils/InterfaceError.ts";
import { getUserConfig } from "../../utils/userConfig.ts";
import Panini from "../../scraping/Panini.ts";

import type { Serie, Product, Store } from "../../types.ts";

async function update() {
  osNotify("CollectorStrategy", "Buscando novedades...")
    .catch(() => {});

  const userConfig = getUserConfig();

  if (!userConfig.trello.list) {
    throw new InterfaceError(
      "Es necesario registrar el id de una lista de trello para adminsitrar la colección",
    );
  }

  const bot = new CollectorStrategy(userConfig.trello.list);
  const series = await SerieModel.all() as unknown as Serie[];
  let newProducts: Product[] = [];

  for (let i = 0; i < series.length; i++) {
    const serie = series[i];
    let storeScrapping: Store;
    let notificationMsg;

    storeScrapping = new Panini();
    
    console.log(`${Colors.cyan("- Buscando novedades para")} ${serie.description ? Colors.blue(serie.name + " - " + serie.description) : Colors.blue(serie.name)}${Colors.cyan("...")}`);   

    const serieNewProducts = await storeScrapping.getNewProducts(serie);

    if (!serieNewProducts.length) {
      console.log(Colors.yellow("! No se encontraron novedades..."));
      continue;
    }

    console.log(Colors.green("+ Novedades encontradas..."));
    
    if (serieNewProducts.length > 1) {
      notificationMsg =
        `¡Se ha agregado más de un nuevo producto de ${serie.name} - ${serie.description} a la lista!`;
    } else {
      notificationMsg =
        `¡Se ha agregado un nuevo producto de ${serie.name}  ${serie.description} a la lista!`;
    }

    osNotify("CollectorStrategy", notificationMsg).catch(() => {});

    await SerieModel.updateLastNumber(
      serie.id,
      serieNewProducts[serieNewProducts.length - 1].number
    );

    newProducts = newProducts.concat(serieNewProducts);
  }

  if (newProducts.length) {
    await bot.updateTrelloList(newProducts);
  }
}

export default update;