import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

interface BusAttributes {
  id: number;
  bus_company_id: number;
  plate_number: string;
  bus_type: string;
  total_seats: number;
  status: "active" | "inactive" | "maintenance";
  created_at?: Date;
  updated_at?: Date;
}

interface BusCreationAttributes
  extends Optional<
    BusAttributes,
    "id" | "status" | "created_at" | "updated_at"
  > {}

class Bus
  extends Model<BusAttributes, BusCreationAttributes>
  implements BusAttributes
{
  public id!: number;
  public bus_company_id!: number;
  public plate_number!: string;
  public bus_type!: string;
  public total_seats!: number;
  public status!: "active" | "inactive" | "maintenance";
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Bus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bus_company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "bus_companies",
        key: "id",
      },
    },
    plate_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    bus_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    total_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "maintenance"),
      allowNull: false,
      defaultValue: "active",
    },
    created_at: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updated_at: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "buses",
    underscored: true,
    timestamps: true,
  }
);

export default Bus;
