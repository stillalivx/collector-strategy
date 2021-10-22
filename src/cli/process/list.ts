import { Colors } from "../../deps.ts";
import SerieModel from "../../database/models/Serie.ts";

import type { Serie } from "../../types.ts";

async function list() {
  console.log(`${Colors.green("+ Obteniendo las series enlistadas...\n")}`);

  const series = await SerieModel.all() as unknown as Serie[];

  series.forEach((serie) => {
    console.log(
      `${Colors.magenta(serie.id.toString())}. ${Colors.yellow(serie.name)}`,
    );
    console.log(
      `${
        Colors.cyan(!serie.description ? "Sin descripción" : serie.description)
      }`,
    );
    console.log(
      `${Colors.gray("Último número:")} ${
        Colors.blue(serie.lastNumber.toString())
      } (${Colors.gray(serie.lastCheck.toString())})\n`,
    );
  });
}

export default list;
