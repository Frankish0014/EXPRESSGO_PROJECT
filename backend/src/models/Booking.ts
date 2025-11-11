import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import BusSchedule from './BusSchedule'; // Import the related model
import User from './User'; // Import the related model

interface BookingAttributes {
  id: number;
  booking_code: string;
  user_id: number;
  schedule_id: number;
  travel_date: Date;
  seat_number: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at?: Date;
  updated_at?: Date;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'booking_code' | 'status' | 'created_at' | 'updated_at'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: number;
  public booking_code!: string;
  public user_id!: number;
  public schedule_id!: number;
  public travel_date!: Date;
  public seat_number!: number;
  public status!: 'confirmed' | 'cancelled' | 'completed';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associated data (optional, populated when using include)
  public readonly user?: User;
  public readonly schedule?: BusSchedule;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    booking_code: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bus_schedules',
        key: 'id',
      },
    },
    travel_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    seat_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'confirmed',
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
    tableName: 'bookings',
    underscored: true,
    timestamps: true,
  }
);

export default Booking;