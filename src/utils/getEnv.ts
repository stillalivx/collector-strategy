export function getTrelloEnv(): { TRELLO_KEY: string; TRELLO_TOKEN: string } {
  const TRELLO_KEY = Deno.env.get("TRELLO_KEY");
  const TRELLO_TOKEN = Deno.env.get("TRELLO_TOKEN");

  if (!TRELLO_KEY) {
    throw new Error("No se ha encontrado la variable de entorno 'TRELLO_KEY'");
  }

  if (!TRELLO_TOKEN) {
    throw new Error(
      "No se ha encontrado la variable de entorno 'TRELLO_TOKEN'",
    );
  }

  return { TRELLO_KEY, TRELLO_TOKEN };
}
