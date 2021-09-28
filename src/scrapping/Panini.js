import { puppeteer } from "../deps.ts";

class Panini {
  browser = null;

  headless = false;

  async openBrowser() {
    this.browser = await puppeteer.launch({
      headless: this.headless,
    });
  }

  async closeBrowser() {
    if (!this.browser) return;

    await this.browser.close();

    this.browser = null;
  }

  async search(tomeName) {
    const browser = this.browser || await puppeteer.launch({
      headless: this.headless,
    });
    const page = await browser.newPage();

    await page.goto(
      `https://www.tiendapanini.com.mx/mexico/soluciones/busqueda.aspx?t=${tomeName}&o=1`,
    );

    const mangas = await page.evaluate(() => {
      const domProductItems = document.querySelectorAll(".product");
      const mangasList = [];

      for (let i = 0; i < domProductItems.length; i++) {
        const domDescription = domProductItems[i].querySelector(".description");

        const title = domDescription?.childNodes[0].childNodes[0].textContent
          ?.trim();
        const url = domDescription?.childNodes[0].childNodes[0].href;
        const description = domDescription?.querySelector(".little-desc")
          ?.textContent?.trim();

        if (!title || !url) {
          continue;
        }

        const titleRegex = title.match(/.*(?=(( - ))|(?<!- )#\d+)/);
        let serie;

        if (titleRegex) {
          serie = titleRegex[0].trim();
        } else {
          serie = title;
        }

        const mangaAdded = mangasList.find((mangaOnList) => {
          return serie.toLowerCase() === mangaOnList.serie.toLowerCase() &&
            description.toLowerCase() === mangaOnList.description.toLowerCase();
        });

        if (!mangaAdded) {
          mangasList.push({ title, serie, description, url });
        }
      }

      return mangasList;
    });

    if (!this.browser) {
      await browser.close();
    } else {
      await page.close();
    }

    return mangas;
  }

  async getSerieURL(productUrl) {
    const browser = this.browser || await puppeteer.launch({
      headless: this.headless,
    });
    const page = await browser.newPage();

    await page.goto(productUrl);

    const serieUrl = await page.evaluate(() => {
      const domActions = document.querySelectorAll(".cart-actions")[1];
      return domActions.childNodes[3].href;
    });

    if (!this.browser) {
      await browser.close();
    } else {
      await page.close();
    }

    return serieUrl;
  }

  async getNextTomes(manga) {
    const browser = this.browser ||  await puppeteer.launch({
      headless: this.headless,
    });
    const page = await browser.newPage();

    await page.goto(manga.page);

    const mangaTomes = await page.evaluate(() => {
      const domProductItems = document.querySelectorAll(".product");
      const mangasList = [];

      for (let i = 0; i < domProductItems.length; i++) {
        const domDescription = domProductItems[i].querySelector(".description");

        const title = domDescription?.childNodes[0].childNodes[0].textContent
          ?.trim();
        const url = domDescription?.childNodes[0].childNodes[0].href;

        if (!title || !url) {
          continue;
        }

        const tomeRegex = title.match(/(?<=#)\d+/);
        const titleRegex = title.match(/.*(?=(( - ))|(?<!- )#\d+)/);
        let tome;
        let serie;

        tome = parseInt(tomeRegex);

        if (!tomeRegex || isNaN(tome) || !titleRegex) {
          continue;
        }

        serie = titleRegex[0].trim();

        mangasList.push({ serie, tome, url });
      }

      return mangasList;
    });

    if (!this.browser) {
      await browser.close();
    } else {
      await page.close();
    }

    const newTomes = mangaTomes
      .filter((item) => item.tome > manga.lastTome);

    newTomes.sort((a, b) => a.tome - b.tome);

    return newTomes;
  }
}

export default Panini;
