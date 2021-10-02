import { dotenvConfig, parse, dirname } from "../deps.ts";

import list from "./process/list.ts";
import add from "./process/add.ts";
import remove from "./process/remove.ts";
import edit from "./process/edit.ts";

dotenvConfig({ path: `${dirname(Deno.execPath())}/.env`, export: true });

const args = parse(Deno.args);

if (args.l || args.list) {
  await list();
} else if (args.a || args.add) {
  await add();
} else if (args.v || args.version) {
  console.log("Version: 0.4.1");
} else if (args.r || args.remove) {
  await remove();
} else if (args.e || args.edit) {
  await edit();
} 
Deno.exit();
