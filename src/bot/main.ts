import { dotenvConfig, osNotify } from "../deps.ts";
import { connectDatabase } from "../database/database.ts";
import { getTrelloEnv } from "../utils/getEnv.ts";
import SerieModel from "../database/models/Serie.ts";
import CollectorStrategy from "./CollectorStrategy.ts";

import type { Serie } from "../types.ts";

dotenvConfig({ path: `${Deno.cwd()}/.env`, export: true });

const HOURS = 10800000;
const bot = new CollectorStrategy();

await connectDatabase();

osNotify("CollectorStrategy", "CollectorStrategy ha iniciado...")
  .catch(() => {});

setInterval(async () => {
  osNotify("CollectorStrategy", "Buscando novedades...")
  .catch(() => {});

  const series = await SerieModel.all() as unknown as Serie[];
  await bot.updateSeriesProducts(series);
}, HOURS);