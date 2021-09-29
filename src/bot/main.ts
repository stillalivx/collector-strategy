import { dotenvConfig, osNotify, dirname } from "../deps.ts";
import { connectDatabase } from "../database/database.ts";
import { getTrelloEnv } from "../utils/getEnv.ts";
import SerieModel from "../database/models/Serie.ts";
import CollectorStrategy from "./CollectorStrategy.ts";

import type { Serie } from "../types.ts";

dotenvConfig({ path: `${dirname(Deno.execPath())}/.env`, export: true });

const HOURS = 10800000;
const bot = new CollectorStrategy();

await connectDatabase();

await osNotify("MangaStrategy", "MangaStrategy ha iniciado...")
  .catch(() => {});

setInterval(async () => {
  const series = await SerieModel.all() as unknown as Serie[];
  await bot.updateSeriesProducts(series);
}, HOURS);
