import setUserConfig from "../../src/utils/setUserConfig.ts";

await setUserConfig();

console.log(Deno.env.toObject());
