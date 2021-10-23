import { DOMParser, Element, HTMLDocument } from "../deps.ts";
import curl from "../utils/curl.ts";

import type { Product, Serie, Store } from "../types.ts";

class Panini implements Store {
  private getProducts(page: HTMLDocument): Product[] {
    const products: Product[] = [];
    const nodes = page.querySelectorAll(
      "#search-list .product > .item > .description",
    );

    nodes.forEach((node) => {
      const product = {
        name: "",
        description: "",
        number: 0,
        url: "",
        serie: 0,
      };

      const name = node.childNodes[0].childNodes[0].textContent || "";
      const description = node.childNodes[2].childNodes[0].textContent || "";
      const url =
        (node.childNodes[0].childNodes[0] as Element).getAttribute("href") ||
        "";

      if (!name || !url) {
        return;
      }

      product.description = description.trim();
      product.url = url.trim();

      if (name.match(/\- \#\d+$/)) {
        product.name = name.substr(0, name.lastIndexOf("-")).trim();
        product.number = parseInt(
          name.substr(name.lastIndexOf("#") + 1).trim(),
        );
      } else if (name.match(/ \#\d+$/)) {
        product.name = name.substr(0, name.lastIndexOf("#")).trim();
        product.number = parseInt(
          name.substr(name.lastIndexOf("#") + 1).trim(),
        );
      } else if (name.match(/N\.\s?\d+$/)) {
        product.name = name.substr(0, name.lastIndexOf("N.")).trim();
        product.number = parseInt(
          name.substr(name.lastIndexOf(".") + 1).trim(),
        );
      } else if (name.match(/Vol\.\s?\d+$/)) {
        product.name = name.substr(0, name.lastIndexOf("Vol.")).trim();
        product.number = parseInt(
          name.substr(name.lastIndexOf(".") + 1).trim(),
        );
      } else {
        product.name = name.trim();
      }

      products.push(product);
    });

    return products;
  }

  private getUrlSerie(page: HTMLDocument): string {
    return (page.querySelectorAll(".cart-actions")[1].childNodes[3] as Element)
      .getAttribute("href") || "";
  }

  async search(name: string): Promise<Product[]> {
    const url = new URL(
      `https://www.tiendapanini.com.mx/mexico/soluciones/busqueda.aspx?t=${name}&o=4`,
    );
    const request = await curl(url.toString());
    const page = new DOMParser().parseFromString(request, "text/html");
    const products: Product[] = [];

    if (!page) {
      throw new Error("Error al cargar la página de busqueda");
    }

    const results = this.getProducts(page);

    results.forEach((result) => {
      const productAdded = products
        .find((product) =>
          result.name === product.name &&
          result.description === product.description
        );

      if (!productAdded) {
        products.push(result);
      }
    });

    return products;
  }

  async getProductUrlSerie(url: string): Promise<string> {
    const request = await curl(url);
    const page = new DOMParser().parseFromString(request, "text/html");

    if (!page) {
      throw new Error(
        "Error al cargar la página para obtener la url de la serie",
      );
    }

    const urlSerie = this.getUrlSerie(page);

    return urlSerie;
  }

  async getNewProducts(serie: Serie) {
    const request = await curl(serie.url);
    const page = new DOMParser().parseFromString(request, "text/html");

    if (!page) {
      throw new Error("Error al cargar la página de la serie");
    }

    const rawProducts = this.getProducts(page);

    const products = rawProducts.map((product) => {
      product.serie = serie.id;
      return product;
    });

    if (products.length === 1 && products[0].number === 0 && serie.lastNumber === 0) {
      return products;
    } else {
      return products
        .filter((product) =>
          product.description === serie.description &&
          product.number > serie.lastNumber
        )
        .sort((a, b) => a.number - b.number);
    }
  }
}

export default Panini;
