import { DataTypes, Model } from "../../deps.ts";

import type { Product } from "../../types.ts";

class Serie extends Model {
  static table = "series";

  static fields = {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    store: {
      type: DataTypes.ENUM,
      values: ["panini", "kamite"],
    },
    lastCheck: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  };

  static async add(
    serie: {
      name: string;
      description: string;
      lastNumber: number;
      url: string;
      store: "panini" | "kamite";
      lastCheck: Date;
    }
  ): Promise<{ lastInsertId: number, affectedRows: number }> {
    return await this.create(serie);
  }

  static async remove(id: number): Promise<{ lastInserId: number, affectedRows: number }> {
    return await this.deleteById(id);
  }
}

export default Serie;
