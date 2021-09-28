export interface Store {
  search: (tomeName: string) => Promise<MangaType[]>;
  getSerieURL: (productUrl: string) => Promise<string>;
  getNextTomes: (manga: FieldManga) => Promise<MangaType[]>;
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
