import { dotenvConfig, parse } from "../deps.ts";
import { getUserConfig } from "../utils/userConfig.ts";
import InterfaceError from "../utils/InterfaceError.ts";

import list from "./process/list.ts";
import add from "./process/add.ts";
import remove from "./process/remove.ts";
import edit from "./process/edit.ts";
import config from "./process/config.ts";

dotenvConfig({ path: `${Deno.cwd()}/.env`, export: true });
getUserConfig();


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

    case "version":
      console.log("Version: 0.4.1");
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

Deno.exit();