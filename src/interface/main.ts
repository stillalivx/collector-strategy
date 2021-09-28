import { parse, dotenvConfig } from "../deps.ts";

import list from "./process/list.ts";
import add from "./process/add.ts";

dotenvConfig({ path: "./.env", export: true });

const args = parse(Deno.args);

if (args.l || args.list) {
  await list();
} else if (args.a || args.add) {
  await add();
} else if (args.a || args.version) {
  console.log("Version: 0.1.0");
}

Deno.exit();
