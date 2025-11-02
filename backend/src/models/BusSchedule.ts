import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BusScheduleAttributes {
  id: number;
  bus_id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_days?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface BusScheduleCreationAttributes extends Optional<BusScheduleAttributes, 'id' | 'available_days' | 'is_active' | 'created_at' | 'updated_at'> {}

class BusSchedule extends Model<BusScheduleAttributes, BusScheduleCreationAttributes> implements BusScheduleAttributes {
  public id!: number;
  public bus_id!: number;
  public route_id!: number;
  public departure_time!: string;
  public arrival_time!: string;
  public price!: number;
  public available_days?: string;
  public is_active?: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

BusSchedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bus_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'buses',
        key: 'id',
      },
    },
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'routes',
        key: 'id',
      },
    },
    departure_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    arrival_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    available_days: {
      type: DataTypes.STRING(100),
      defaultValue: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'bus_schedules',
    underscored: true,
    timestamps: true,
  }
);

export default BusSchedule;