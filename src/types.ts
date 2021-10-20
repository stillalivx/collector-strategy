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

export type Store = {
  search: (name: string) => Promise<Product[]>;
  getProductUrlSerie: (url: string) => Promise<string>;
  getNewProducts: (serie: Serie) => Promise<Product[]>;
};

export type EnumStore = "panini" | "kamite";

export type QueryDBResponse = {
  lastInsertId: number;
  affectedRows: number;
};

export type UserConfig = {
  trello: {
    list: string;
  };
  accounts: {
    panini: {
      username: string;
      password: string;
    };
  };
};
