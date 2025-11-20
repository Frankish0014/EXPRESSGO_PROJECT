import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import BusSchedule from './BusSchedule';
import User from './User';

interface BookingAttributes {
  id: number;
  booking_code: string;
  user_id: number;
  schedule_id: number;
  travel_date: Date;
  seat_number: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  booking_type: 'one-way' | 'round-trip' | 'multi-city';
  parent_booking_id?: number;
  leg_sequence?: number;
  return_travel_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface BookingCreationAttributes 
  extends Optional<BookingAttributes, 
    'id' | 'booking_code' | 'status' | 'booking_type' | 
    'parent_booking_id' | 'leg_sequence' | 'return_travel_date' | 
    'created_at' | 'updated_at'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> 
  implements BookingAttributes {
  public id!: number;
  public booking_code!: string;
  public user_id!: number;
  public schedule_id!: number;
  public travel_date!: Date;
  public seat_number!: number;
  public status!: 'confirmed' | 'cancelled' | 'completed';
  public booking_type!: 'one-way' | 'round-trip' | 'multi-city';
  public parent_booking_id?: number;
  public leg_sequence?: number;
  public return_travel_date?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associated data (optional, populated when using include)
  public readonly user?: User;
  public readonly schedule?: BusSchedule;
  public readonly parentBooking?: Booking;
  public readonly childBookings?: Booking[];
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    booking_code: {
      type: DataTypes.STRING(30), // Changed from 25 to 30
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
    booking_type: {
      type: DataTypes.ENUM('one-way', 'round-trip', 'multi-city'),
      allowNull: false,
      defaultValue: 'one-way',
    },
    parent_booking_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'bookings',
        key: 'id',
      },
    },
    leg_sequence: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    return_travel_date: {
      type: DataTypes.DATEONLY,
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
    tableName: 'bookings',
    underscored: true,
    timestamps: true,
  }
);

export default Booking;