import Panini from "../../../src/scraping/Panini.js";

import type { Store } from "../../../src/types.ts";

const panini: Store = new Panini();
const products = await panini.search("sword art online");

console.log(products);