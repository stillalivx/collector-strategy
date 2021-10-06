import { dirname, dotenvConfig, osNotify } from "../deps.ts";
import { connectDatabase } from "../database/database.ts";
import { getUserConfig } from "../utils/userConfig.ts";
import SerieModel from "../database/models/Serie.ts";
import CollectorStrategy from "./CollectorStrategy.ts";
import InterfaceError from "../utils/InterfaceError.ts";

import type { Serie } from "../types.ts";

async function main() {
  await osNotify("CollectorStrategy", "Buscando novedades...")
    .catch(() => {});

  const series = await SerieModel.all() as unknown as Serie[];
  await bot.updateSeriesProducts(series);
}

dotenvConfig({ path: `${dirname(Deno.execPath())}/.env`, export: true });

const userConfig = getUserConfig();

if (!userConfig.trello.list) {
  throw new InterfaceError(
    "Es necesario registrar el id de una lista de trello para adminsitrar la colección",
  );
}

const HOURS = 10800000;
const bot = new CollectorStrategy(userConfig.trello.list);

await connectDatabase();

await osNotify("CollectorStrategy", "CollectorStrategy ha iniciado...")
  .catch(() => {});

await main();

setInterval(main, HOURS);
