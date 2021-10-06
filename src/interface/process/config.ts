import { parse } from "../../deps.ts";
import { setUserConfig } from "../../utils/userConfig.ts";
import InterfaceError from "../../utils/InterfaceError.ts";

function appendProp(obj: any, prop: string) {
  return obj[prop] = {};
}

async function config() {
  const args = parse(Deno.args);
  const configName = args._[1] as string;
  const configValue = args._[2];

  const configModel: any = {
    trello: {
      list: "",
    },
    accounts: {
      panini: {
        username: "",
        password: "",
      },
    },
  };

  if (!configName) {
    throw new InterfaceError(
      "No se ha declarado el nombre de la configuración",
    );
  } else if (!configValue) {
    throw new InterfaceError("No se ha declarado el valor de la configuración");
  }

  const regexMatch = configName.match(/(\w+)\.(\w+)\.?(\w+)?/);
  
  if (!regexMatch) {
    throw new InterfaceError("El nombre de la configuración no es valida");
  }
  
  const configFmt: any = {};

  if (!Object.keys(configModel).includes(regexMatch[1])) {
    throw new InterfaceError(`No existe "${regexMatch[1]}" en la configuración`);
  }

  if (!Object.keys(configModel[regexMatch[1]]).includes(regexMatch[2])) {
    throw new InterfaceError(`No existe "${regexMatch[2]}" en la configuración de "${regexMatch[1]}"`);
  }

  configFmt[regexMatch[1]] = {};

  if (regexMatch[3]) {
    if (!Object.keys(configModel[regexMatch[1]][regexMatch[2]]).includes(regexMatch[3])) {
      throw new InterfaceError(`No existe "${regexMatch[3]}" en la configuración de "${regexMatch[2]}"`);
    }
    
    configFmt[regexMatch[1]][regexMatch[2]] = {};
    configFmt[regexMatch[1]][regexMatch[2]][regexMatch[3]] = configValue;
  } else {
    configFmt[regexMatch[1]][regexMatch[2]] = configValue;
  }

  setUserConfig(configFmt);
}

export default config;
