import Panini from "../../../src/scraping/Panini.ts";

const panini = new Panini();
const results = await panini.search("sword art online");

console.log(results);

Deno.exit();