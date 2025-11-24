import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

interface TripAttributes {
  id: number;
  schedule_id: number;
  trip_date: Date;
  departure_time: string;
  arrival_time: string;
  total_seats: number;
  booked_seats: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  created_at?: Date;
  updated_at?: Date;
}

interface TripCreationAttributes
  extends Omit<
    Optional<
      TripAttributes,
      "id" | "booked_seats" | "status" | "created_at" | "updated_at"
    >,
    "trip_date"
  > {
  trip_date: string | Date; // Allow string for DATEONLY input
}

class Trip
  extends Model<TripAttributes, TripCreationAttributes>
  implements TripAttributes
{
  public id!: number;
  public schedule_id!: number;
  public trip_date!: Date;
  public departure_time!: string;
  public arrival_time!: string;
  public total_seats!: number;
  public booked_seats!: number;
  public status!: "scheduled" | "in-progress" | "completed" | "cancelled";
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Trip.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "bus_schedules",
        key: "id",
      },
    },
    trip_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    departure_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    arrival_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    total_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    booked_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "in-progress",
        "completed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "scheduled",
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
    tableName: "trips",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["schedule_id", "trip_date"],
      },
    ],
  }
);

export default Trip;
