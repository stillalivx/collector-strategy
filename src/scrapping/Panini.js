import { puppeteer } from "../deps.ts";

class Panini {

  #browser = null;

  #puppeteerConfig = {
    headless: false
  };

  #pageConfig = {
    waitUntil: "load",
    timeout: 0
  };

  async #scrappingProducts(page) {
    const scrappingProducts = await page.evaluate(() => {
      const products = [];
      const DOMProducts = document.querySelectorAll(".product");

      DOMProducts.forEach((DOMProduct) => {
        const product = {
          name: "",
          description: "",
          number: 0,
          url: "",
        };

        const DOMDataContainer = DOMProduct.querySelector(".description");

        const name = DOMDataContainer.childNodes[0].childNodes[0]?.textContent
          .trim();
        const description =
          DOMDataContainer.querySelector(".little-desc")?.textContent.trim() ||
          "";
        const url = DOMDataContainer.childNodes[0].childNodes[0]?.textContent
          .trim();

        if (!name || !url) {
          return;
        }

        product.description = description;

        if (name.match(/\- \#\d+$/)) {
          product.name = name.substr(0, name.lastIndexOf("-")).trim();
          product.number = parseInt(name.substr(name.lastIndexOf("#") + 1).trim());
        } else if (name.match(/ \#\d+$/)) {
          product.name = name.substr(0, name.lastIndexOf("#")).trim();
          product.number = parseInt(name.substr(name.lastIndexOf("#") + 1).trim());
        } else if (name.match(/N\.\s?\d+$/)) {
          product.name = name.substr(0, name.lastIndexOf("N.")).trim();
          product.number = parseInt(name.substr(name.lastIndexOf(".") + 1).trim());
        } else if (name.match(/Vol\.\s?\d+$/)) {
          product.name = name.substr(0, name.lastIndexOf("Vol.")).trim();
          product.number = parseInt(name.substr(name.lastIndexOf(".") + 1).trim());
        } else {
          product.name = name;
        }

        const productAdded = products.find(productInList =>
          productInList.name === product.name &&
          productInList.description === product.description
        );

        if (!productAdded) {
          products.push(product);
        }
      });

      return products;
    });

    return scrappingProducts;
  }

  async #scrappingUrlProductSerie(page) {
    const scrappingUrl = await page.evaluate(() => {
      return document.querySelectorAll(".cart-actions")[1].childNodes[3].href;
    });

    return scrappingUrl;
  }

  async openBrowser() {
    this.#browser = await puppeteer.launch(this.#puppeteerConfig);
  }

  async closeBrowser() {
    if (!this.#browser) return;

    await this.#browser.close();

    this.#browser = null;
  }

  async search(productName) {
    const browser = this.#browser || await puppeteer.launch(this.#puppeteerConfig);
    const page = await browser.newPage();

    await page.goto(
      `https://www.tiendapanini.com.mx/mexico/soluciones/busqueda.aspx?t=${productName}`,
      this.#pageConfig
    );

    const searchResult = await this.#scrappingProducts(page);

    if (!this.#browser) {
      await browser.close();
    } else {
      await page.close();
    }

    return searchResult;
  }

  async getProductUrlSerie(productUrl) {
    const browser = this.#browser || await puppeteer.launch(this.#puppeteerConfig);
    const page = await browser.newPage();

    await page.goto(productUrl);

    const url = await this.#scrappingUrl(page);

    if (!this.#browser) {
      await browser.close();
    } else {
      await page.close();
    }

    return url;
  }

  async getNewSerieProducts(serie) {
    const browser = this.#browser || await puppeteer.launch(this.#puppeteerConfig);
    const page = await browser.newPage();

    await page.goto(product.url, this.#pageConfig);

    const seriesProducts = await this.#scrappingProducts(page);

    const newSeriesProducts = seriesProducts
      .filter(product => product.number > serie.lastNumber)
      .sort((a, b) => a.number - b.number);

    if (!this.#browser) {
      await browser.close();
    } else {
      await page.close();
    }

    return newSeriesProducts;
  }
  
}

export default Panini;
