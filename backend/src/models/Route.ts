import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface RouteAttributes {
  id: number;
  departure_city: string;
  arrival_city: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface RouteCreationAttributes extends Optional<RouteAttributes, 'id' | 'distance_km' | 'estimated_duration_minutes' | 'created_at' | 'updated_at'> {}

class Route extends Model<RouteAttributes, RouteCreationAttributes> implements RouteAttributes {
  public id!: number;
  public departure_city!: string;
  public arrival_city!: string;
  public distance_km?: number;
  public estimated_duration_minutes?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Route.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    departure_city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    arrival_city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    distance_km: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    estimated_duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'routes',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['departure_city', 'arrival_city'],
      },
    ],
  }
);

export default Route;