import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

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

  // Helper method to generate booking code
  static generateBookingCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${timestamp}${random}`;
  }
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    booking_code: {
      type: DataTypes.STRING(20),
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
    hooks: {
      beforeCreate: async (booking: Booking) => {
        if (!booking.booking_code) {
          booking.booking_code = Booking.generateBookingCode();
        }
      },
    },
  }
);

export default Booking;