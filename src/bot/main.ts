import { dotenvConfig, osNotify } from "../deps.ts";
import { connectDatabase } from "../database/database.ts";
import { getTrelloEnv } from "../utils/getEnv.ts";
import Manga from "../database/models/Manga.ts";
import MangaStrategy from "./MangaStrategy.ts";

import type { FieldManga } from "../types.ts";

dotenvConfig({ path: "./.env", export: true });

const HOURS = 10800000;
const { TRELLO_KEY, TRELLO_TOKEN } = getTrelloEnv();
const bot = new MangaStrategy(TRELLO_KEY, TRELLO_TOKEN);

await connectDatabase();

await osNotify("MangaStrategy", "MangaStrategy ha iniciado...")
  .catch(() => {});

setInterval(async () => {
  const series = await Manga.all() as unknown as FieldManga[];
  const newSeries = await bot.getNextSeries(series);

  if (newSeries.length) {
    await bot.sortMangaList(newSeries);
  }
}, HOURS);