import { osNotify } from "../deps.ts";
import Panini from "../scrapping/Panini.js";
import { Trello } from "../deps.ts";

import type { FieldManga, MangaType, Store } from "../types.ts";

class MangaStrategy {
  private trello: Trello;

  private listId = "6130d3ee7345bb23bd03d2e8";

  constructor(trelloKey: string, trelloToken: string) {
    this.trello = new Trello(trelloKey, trelloToken);
  }

  async getNextSeries(mangas: FieldManga[]) {
    const panini = new Panini();

    let storeScrapping: Store;
    let notifyMessage = "";
    let nextTomes: MangaType[] = [];

    await panini.openBrowser();

    for (let i = 0; i < mangas.length; i++) {
      switch (mangas[i].store) {
        default:
          storeScrapping = panini;
          break;
      }

      const nextMangas = await storeScrapping.getNextTomes(mangas[i]);
      nextTomes = nextTomes.concat(nextMangas);

      if (!nextMangas.length) {
        continue;
      }

      if (nextMangas.length > 1) {
        notifyMessage = `¡Se ha agregado más de un tomo de ${
          mangas[i].name
        } a la lista!`;
      } else {
        notifyMessage = `¡Se ha agregado un nuevo tomo de ${
          mangas[i].name
        } a la lista!`;
      }

      await osNotify({
        title: "MangaStrategy",
        message: notifyMessage,
      }).catch(() => {});
    }

    await panini.closeBrowser();

    return nextTomes;
  }

  async sortMangaList(mangas: MangaType[]) {
    const trelloList = this.trello.list(this.listId);
    const trelloCard = this.trello.card();

    const mangaListCards = await trelloList.getCards();
    
    const serieCards: MangaType[][] = [];
    const serieWithLessThan: MangaType[][] = [];
    const serieWithMoreThan: MangaType[][] = [];
    const sortedCards: MangaType[] = [];

    let totalWithLessThan = 0;
    let totalWithMoreThan = 0;
    let repeatWithLessThan = 0;
    let repeatWithMoreThan = 0;

    for (let i = 0; i < mangaListCards.length; i++) {
      const card = mangaListCards[i];
      const mangaFmt: MangaType = JSON.parse(card.desc);

      const serieIndex = serieCards
        .findIndex((item) => {
          let shortName = "";
          let longName = "";

          if (!item[0]) return false;

          if ((mangaFmt.serie?.length as number) < (item[0].serie?.length as number)) {
            shortName = mangaFmt.serie?.toLowerCase() as string;
            longName = item[0].serie?.toLowerCase() as string;
          } else {
            shortName = item[0].serie?.toLowerCase() as string;
            longName = mangaFmt.serie?.toLowerCase() as string;
          }

          return longName.includes(shortName);
        });

      if (serieIndex === -1) {
        serieCards.push([mangaFmt]);
      } else {
        const mangaExists = serieCards[serieIndex]
          .find((item) => item.url === mangaFmt.url);

        if (!mangaExists) {
          serieCards[serieIndex].push(mangaFmt);
        }
      }

      await trelloCard.delete(card.id);
    }

    for (let i = 0; i < mangas.length; i++) {
      const serieIndex = serieCards
        .findIndex((item) => {
          let shortName = "";
          let longName = "";

          if (!item[0]) return false;

          if ((mangas[i].serie?.length as number) < (item[0].serie?.length as number)) {
            shortName = mangas[i].serie?.toLowerCase() as string;
            longName = item[0].serie?.toLowerCase() as string;
          } else {
            shortName = item[0].serie?.toLowerCase() as string;
            longName = mangas[i].serie?.toLowerCase() as string;
          }

          return longName.includes(shortName);
        });

      if (serieIndex === -1) {
        serieCards.push([mangas[i]]);
      } else {
        const mangaExists = serieCards[serieIndex]
          .find((item) => item.url === mangas[i].url);

        if (!mangaExists) {
          serieCards[serieIndex].push(mangas[i]);
        }
      }
    }

    serieCards.forEach((serie) => {
      if (serie.length === 1) {
        sortedCards.push(serie[0]);
      } else if (serie.length <= 6) {
        serieWithLessThan.push(serie);
        totalWithLessThan += serie.length;
      } else {
        serieWithMoreThan.push(serie);
        totalWithMoreThan += serie.length;
      }
    });

    if (serieWithLessThan.length) {
      let withLessIndex = 0;

      while (repeatWithLessThan < totalWithLessThan) {
        if (withLessIndex === serieWithLessThan.length) {
          withLessIndex = 0;
        }

        if (serieWithLessThan[withLessIndex].length) {
          for (let i = 0; i < 3; i++) {
            if (!serieWithLessThan[withLessIndex][0]) {
              break;
            }

            sortedCards.push(serieWithLessThan[withLessIndex][0]);
            serieWithLessThan[withLessIndex].splice(0, 1);
          }
        }

        withLessIndex++;
        repeatWithLessThan++;
      }
    }

    if (serieWithMoreThan.length) {
      let withMoreIndex = 0;

      while (repeatWithMoreThan < totalWithMoreThan) {
        if (withMoreIndex === serieWithMoreThan.length) {
          withMoreIndex = 0;
        }

        if (serieWithMoreThan[withMoreIndex].length) {
          for (let i = 0; i < 6; i++) {
            if (!serieWithMoreThan[withMoreIndex][0]) {
              break;
            }

            sortedCards.push(serieWithMoreThan[withMoreIndex][0]);
            serieWithMoreThan[withMoreIndex].splice(0, 1);
          }
        }

        withMoreIndex++;
        repeatWithMoreThan++;
      }
    }

    for (let i = 0; i < sortedCards.length; i++) {
      await trelloList.createCard({
        name: `${sortedCards[i].serie} - #${sortedCards[i].tome}`,
        desc: JSON.stringify(sortedCards[i]),
        urlSource: sortedCards[i].url as string,
        pos: "bottom",
      });
    }
  }
}

export default MangaStrategy;
