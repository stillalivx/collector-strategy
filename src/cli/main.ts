import { dotenvConfig, parse } from "../deps.ts";
import { closeDatabase, connectDatabase } from "../database/database.ts";
import InterfaceError from "../utils/InterfaceError.ts";

import list from "./process/list.ts";
import add from "./process/add.ts";
import remove from "./process/remove.ts";
import edit from "./process/edit.ts";
import config from "./process/config.ts";
import update from "./process/update.ts";

dotenvConfig({ path: `${Deno.cwd()}/.env`, export: true });

const database = await connectDatabase();

try {
  const args = parse(Deno.args);
  const command = args._[0];

  switch (command) {
    case "list":
      await list();
      break;

    case "add":
      await add();
      break;

    case "remove":
      await remove();
      break;

    case "edit":
      await edit();
      break;

    case "config":
      await config();
      break;

    case "update":
      await update();
      break;

    case "version":
      console.log("Version: 1.0.2");
      break;

    default:
      break;
  }
} catch (e) {
  if (e instanceof InterfaceError) {
    console.log(e.toString());
  } else {
    console.error(e);
  }
}

await closeDatabase(database);

Deno.exit();
