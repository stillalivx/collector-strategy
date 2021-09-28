import { DataTypes, Model } from "../../deps.ts";

class Manga extends Model {
  static table = "mangas";

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
    lastTome: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    page: {
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
}

export default Manga;
