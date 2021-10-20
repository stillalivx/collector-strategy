import curl from "../../src/utils/curl.ts";
import { exec, OutputMode } from "../../src/deps.ts";

const page =  await curl("https://www.tiendapanini.com.mx/mexico/soluciones/busqueda.aspx?t=sword%20art%20online");

console.log(page);
