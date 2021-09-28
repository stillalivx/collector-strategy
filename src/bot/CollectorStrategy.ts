import { osNotify } from "../deps.ts";
import Panini from "../scrapping/Panini.js";
import { Trello } from "../deps.ts";
import { getTrelloEnv } from "../utils/getEnv.ts";

import type { Product, Store, Serie } from "../types.ts";

class CollectorStrategy {

  private listId = "6130d3ee7345bb23bd03d2e8";

  private async updateTrelloList(products: Product[]) {
    const { TRELLO_KEY, TRELLO_TOKEN } = getTrelloEnv();

    const trello = new Trello(TRELLO_KEY, TRELLO_TOKEN);
    const trelloCard = trello.card();

    const trelloList = trello.list(this.listId);

    const series: Product[][] = [];
    const serieWithLessThan: MangaType[][] = [];
    const serieWithMoreThan: MangaType[][] = [];
    const sortedCards: Product[] = [];

    let totalWithLessThan = 0;
    let totalWithMoreThan = 0;
    let repeatWithLessThan = 0;
    let repeatWithMoreThan = 0;

    const listCards = await trelloList.getCards();

    for (let i = 0; i < listCards.length; i++) {
      const card = listCards[i];
      const product: Product = JSON.parse(card.desc);

      const serieIndex = series
        .findIndex((serie) => {
          const firstSerieProduct = serie[0];

          if (!firstSerieProduct) return false;

          if (product.description !== firstSerieProduct.description) {
            return false;
          } else if (product.name.length < firstSerieProduct.name.length) {
            return firstSerieProduct.name.toLowerCase()
              .includes(product.name.toLowerCase());
          } else {
            return product.name.toLowerCase()
              .includes(firstSerieProduct.name.toLowerCase());
          }
        });

      if (serieIndex === -1) {
        series.push([product]);
      } else {
        const productExists = series[serieIndex]
          .find((item) => item.url === product.url);

        if (!productExists) {
          serie[serieIndex].push(product);
        }
      }

      await trelloCard.delete(card.id);
    }

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const serieIndex = series
        .findIndex((serie) => {
          const firstSerieProduct = serie[0];

          if (!firstSerieProduct) return false;

          if (product.description !== firstSerieProduct.description) {
            return false;
          } else if (product.name.length < firstSerieProduct.name.length) {
            return firstSerieProduct.name.toLowerCase()
              .includes(product.name.toLowerCase());
          } else {
            return product.name.toLowerCase()
              .includes(firstSerieProduct.name.toLowerCase());
          }
        });

      if (serieIndex === -1) {
        series.push([product]);
      } else {
        const productExists = series[serieIndex]
          .find((item) => item.url === product.url);

        if (!productExists) {
          series[serieIndex].push(product);
        }
      }
    }

    series.forEach((serie) => {
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
      const card = sortedCards[i];

      await trelloList.createCard({
        name: `${card.serie} - #${card.number}`,
        desc: JSON.stringify(card),
        urlSource: card.url,
        pos: "bottom",
      });
    }
  }

  async updateSeriesProducts(series: Serie[]) {
    const storeScrapping: Store = new Panini();
    let newProducts = [];
    let notificationMsg = "";

    storeScrapping.openBrowser();

    for (let i = 0; i < series.length; i++) {
      const serie = series[i];
      const newSeriesProducts = await storeScrapping.getNewSerieProducts(serie);

      if (!newSeriesProducts.length) {
        continue;
      }

      if (newSeriesProducts.length > 1) {
        notifyMessage = `¡Se ha agregado más de un nuevo producto de ${
          serie.name
        } a la lista!`;
      } else {
        notifyMessage = `¡Se ha agregado un nuevo producto de ${
          serie.name
        } a la lista!`;
      }

      newProducts = newProducts.concat(newSeriesProducts);
    }

    await this.updateTrelloList(newProducts);
  }
}

export default MangaStrategy;
