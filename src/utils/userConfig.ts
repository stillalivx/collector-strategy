import { UserConfig } from "../types.ts";

function deepPropsCopy(target: any, source: any): any {
  for (const prop in source) {
    if (typeof source[prop] === "object") {
      if (target[prop] && typeof target[prop] === "object") {
        target[prop] = deepPropsCopy(target[prop], source[prop]);
      } else {
        target[prop] = deepPropsCopy({}, source[prop]);
      }
    } else {
      target[prop] = source[prop];
    }
  }

  return target;
}

export function getUserConfig() {
  let userConfig: UserConfig = {
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

  try {
    const configFile = Deno.readTextFileSync(`${Deno.cwd()}/etc/config.json`);
    Object.assign(userConfig, JSON.parse(configFile));
  } catch (e) {
    Deno.writeTextFileSync(
      `${Deno.cwd()}/etc/config.json`,
      JSON.stringify(userConfig),
    );
  }

  return userConfig;
}

export function setUserConfig(config: {
  trello?: {
    list: string;
  };
  accounts?: {
    panini?: {
      username?: string;
      password?: string;
    };
  };
}) {
  const userConfigFromFile = getUserConfig();
  const newUserConfig = deepPropsCopy(userConfigFromFile, config);

  Deno.writeTextFileSync(
    `${Deno.cwd()}/etc/config.json`,
    JSON.stringify(newUserConfig),
  );

  return newUserConfig;
}
