 import User from './User';
import BusCompany from './BusCompany';
import Bus from './Bus';
import Route from './Route';
import BusSchedule from './BusSchedule';
import Trip from './Trip';
import Booking from './Booking';
import TokenBlacklist from './TokenBlacklist';

// Define associations

// BusCompany -> Bus (One-to-Many)
BusCompany.hasMany(Bus, {
  foreignKey: 'bus_company_id',
  as: 'buses',
});
Bus.belongsTo(BusCompany, {
  foreignKey: 'bus_company_id',
  as: 'company',
});

// Bus -> BusSchedule (One-to-Many)
Bus.hasMany(BusSchedule, {
  foreignKey: 'bus_id',
  as: 'schedules',
});
BusSchedule.belongsTo(Bus, {
  foreignKey: 'bus_id',
  as: 'bus',
});

// Route -> BusSchedule (One-to-Many)
Route.hasMany(BusSchedule, {
  foreignKey: 'route_id',
  as: 'schedules',
});
BusSchedule.belongsTo(Route, {
  foreignKey: 'route_id',
  as: 'route',
});

// User -> Booking (One-to-Many)
User.hasMany(Booking, {
  foreignKey: 'user_id',
  as: 'bookings',
});
Booking.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// BusSchedule -> Trip (One-to-Many)
BusSchedule.hasMany(Trip, {
  foreignKey: 'schedule_id',
  as: 'trips',
});
Trip.belongsTo(BusSchedule, {
  foreignKey: 'schedule_id',
  as: 'schedule',
});

// Trip -> Booking (One-to-Many)
Trip.hasMany(Booking, {
  foreignKey: 'trip_id',
  as: 'bookings',
});
Booking.belongsTo(Trip, {
  foreignKey: 'trip_id',
  as: 'trip',
});

// BusSchedule -> Booking (One-to-Many) - Keep for backward compatibility
BusSchedule.hasMany(Booking, {
  foreignKey: 'schedule_id',
  as: 'bookings',
});
Booking.belongsTo(BusSchedule, {
  foreignKey: 'schedule_id',
  as: 'schedule',
});

// Booking -> Booking (Self-referential for round-trip and multi-city)
Booking.hasMany(Booking, {
  foreignKey: 'parent_booking_id',
  as: 'childBookings',
});
Booking.belongsTo(Booking, {
  foreignKey: 'parent_booking_id',
  as: 'parentBooking',
});

// User -> TokenBlacklist (One-to-Many)
User.hasMany(TokenBlacklist, {
  foreignKey: 'user_id',
  as: 'blacklisted_tokens',
});
TokenBlacklist.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

export {
  User,
  BusCompany,
  Bus,
  Route,
  BusSchedule,
  Trip,
  Booking,
  TokenBlacklist,
};

export default {
  User,
  BusCompany,
  Bus,
  Route,
  BusSchedule,
  Trip,
  Booking,
  TokenBlacklist,
};
