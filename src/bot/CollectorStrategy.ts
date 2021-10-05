import { osNotify } from "../deps.ts";
import Panini from "../scraping/Panini.js";
import { Trello } from "../deps.ts";
import { getTrelloEnv } from "../utils/getEnv.ts";

import type { Product, Serie, Store } from "../types.ts";

class CollectorStrategy {
  private trello;

  private trelloList;

  private trelloCard;

  constructor(listId: string) {
    const { TRELLO_KEY, TRELLO_TOKEN } = getTrelloEnv();

    this.trello = new Trello(TRELLO_KEY, TRELLO_TOKEN);
    this.trelloCard = this.trello.card();
    this.trelloList = this.trello.list(listId);
  }

  async updateSeriesProducts(series: Serie[]) {
    const storeScrapping: Store = new Panini();
    let newProducts: Product[] = [];
    let notificationMsg = "";

    await storeScrapping.openBrowser();

    for (let i = 0; i < series.length; i++) {
      const serie = series[i];
      const newSeriesProducts = await storeScrapping.getNewSerieProducts(serie);

      if (!newSeriesProducts.length) {
        continue;
      }

      if (newSeriesProducts.length > 1) {
        notificationMsg =
          `¡Se ha agregado más de un nuevo producto de ${serie.name} a la lista!`;
      } else {
        notificationMsg =
          `¡Se ha agregado un nuevo producto de ${serie.name} a la lista!`;
      }

      osNotify("CollectorStrategy", notificationMsg);

      newProducts = newProducts.concat(newSeriesProducts);
    }

    await storeScrapping.closeBrowser();

    if (newProducts.length) {
      await this.updateTrelloList(newProducts);
    }
  }

  private async createTrelloCards(products: Product[]) {
    for (let i = 0; i < products.length; i++) {
      const card = products[i];
      const name = `${card.name}${
        card.description ? ": " + card.description : ""
      } - #${card.number}`;

      await this.trelloList.createCard({
        name,
        desc: JSON.stringify(card),
        urlSource: card.url,
        pos: "bottom",
      });
    }
  }

  private sortCards(series: Product[][]): Product[] {
    const serieWithLessThan: Product[][] = [];
    const serieWithMoreThan: Product[][] = [];
    const sortedCards: Product[] = [];

    let totalWithLessThan = 0;
    let totalWithMoreThan = 0;
    let repeatWithLessThan = 0;
    let repeatWithMoreThan = 0;

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

    return sortedCards;
  }

  async updateTrelloList(products: Product[]) {
    const series: Product[][] = [];
    const listCards = await this.trelloList.getCards();

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
        const serieOnList = series[serieIndex];
        const productExists = serieOnList
          .find((item) => item.url === product.url);
        const firstNumber = serieOnList[0].number;

        if (!productExists && product.number > firstNumber) {
          series[serieIndex].push(product);
        }
      }

      await this.trelloCard.delete(card.id);
    }

    const sortedCards = this.sortCards(series);

    await this.createTrelloCards(sortedCards);
  }

  async deleteFromTrelloList(serie: Serie) {
    const products: Product[] = [];
    const listCards = await this.trelloList.getCards();

    for (let i = 0; i < listCards.length; i++) {
      const card = listCards[i];
      const product = JSON.parse(card.desc);

      const productExists = products
        .find((item) => item.url === product.url);

      if (!productExists) {
        products.push(product);
      }

      await this.trelloCard.delete(card.id);
    }

    const newList = products.filter((product) => product.name !== serie.name);

    await this.createTrelloCards(newList);
  }
}

export default CollectorStrategy;
