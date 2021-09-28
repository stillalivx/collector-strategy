export type Serie = {
  id: number;
  name: string;
  description: string;
  lastNumber: number;
  url: string;
  store: EnumStore;
  lastCheck: string | Date;
};

export type Product = {
  name: string;
  description: string;
  number: number;
  url: string;
};

export interface Store {
  openBrowser: () => Promise<void>;
  closeBrowser: () => Promise<void>;
  search: (name: string) => Promise<Product[]>;
  getProductUrlSerie: (productUrl: string) => Promise<string>;
  getNewSerieProducts: (serie: Serie) => Promise<Product[]>;
}

export type EnumStore = "panini" | "kamite";

export type MangaType = {
  title?: string;
  serie?: string;
  tome?: number | null;
  url?: string;
  description?: string;
};

export type FieldManga = {
  id?: number;
  name: string;
  lastTome: number;
  page: string;
  store: EnumStore;
  lastCheck: string | Date;
};
