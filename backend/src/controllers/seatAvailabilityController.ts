import { Request, Response } from 'express';
import Booking from '../models/Booking';
import BusSchedule from '../models/BusSchedule';
import Bus from '../models/Bus';
import Route from '../models/Route';
import { sendSuccess, sendError } from '../utils/responseUtils';
import { logError } from '../utils/loggerUtils';
import { Op } from 'sequelize';

export class SeatAvailabilityController {
  // Check real-time seat availability for a schedule
  static async checkSeatAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { schedule_id, travel_date } = req.query;

      if (!schedule_id || !travel_date) {
        sendError(res, 'Schedule ID and travel date are required', 400);
        return;
      }

      // Get schedule with bus information
      const schedule = await BusSchedule.findByPk(schedule_id as string, {
        include: [
          { model: Bus, as: 'bus' },
          { model: Route, as: 'route' },
        ],
      });

      if (!schedule) {
        sendError(res, 'Schedule not found', 404);
        return;
      }

      const bus = schedule.bus as any;
      if (!bus) {
        sendError(res, 'Bus not found for this schedule', 404);
        return;
      }

      // Get all bookings for this schedule and date (excluding cancelled)
      const bookings = await Booking.findAll({
        where: {
          schedule_id: parseInt(schedule_id as string),
          travel_date: travel_date as string,
          status: {
            [Op.not]: 'cancelled',
          },
        },
      });

      // Get booked seat numbers
      const bookedSeats = bookings.map(booking => booking.seat_number);

      // Calculate available seats
      const totalSeats = bus.total_seats;
      const availableSeats = totalSeats - bookedSeats.length;
      const occupiedSeats = bookedSeats.length;

      // Generate seat map (1 to total_seats)
      const seatMap = [];
      for (let i = 1; i <= totalSeats; i++) {
        seatMap.push({
          seat_number: i,
          is_available: !bookedSeats.includes(i),
        });
      }

      sendSuccess(res, {
        schedule_id: parseInt(schedule_id as string),
        travel_date,
        total_seats: totalSeats,
        available_seats: availableSeats,
        occupied_seats: occupiedSeats,
        booked_seats: bookedSeats,
        seat_map: seatMap,
        schedule: {
          id: schedule.id,
          departure_time: schedule.departure_time,
          arrival_time: schedule.arrival_time,
          price: schedule.price,
          bus: {
            id: bus.id,
            plate_number: bus.plate_number,
            bus_type: bus.bus_type,
            total_seats: bus.total_seats,
          },
          route: schedule.route,
        },
      }, 'Seat availability retrieved successfully');
    } catch (error: any) {
      logError('Check seat availability error', error);
      sendError(res, error.message || 'Failed to check seat availability', 500);
    }
  }

  // Get available seats for multiple schedules (for search results)
  static async getMultipleSchedulesAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { schedule_ids, travel_date } = req.body;

      if (!schedule_ids || !Array.isArray(schedule_ids) || schedule_ids.length === 0) {
        sendError(res, 'Schedule IDs array and travel date are required', 400);
        return;
      }

      if (!travel_date) {
        sendError(res, 'Travel date is required', 400);
        return;
      }

      // Get all schedules with bus information
      const schedules = await BusSchedule.findAll({
        where: {
          id: {
            [Op.in]: schedule_ids,
          },
          is_active: true,
        },
        include: [
          { model: Bus, as: 'bus' },
          { model: Route, as: 'route' },
        ],
      });

      // Get all bookings for these schedules and date
      const bookings = await Booking.findAll({
        where: {
          schedule_id: {
            [Op.in]: schedule_ids,
          },
          travel_date,
          status: {
            [Op.not]: 'cancelled',
          },
        },
      });

      // Group bookings by schedule_id
      const bookingsBySchedule: { [key: number]: number[] } = {};
      bookings.forEach(booking => {
        if (!bookingsBySchedule[booking.schedule_id]) {
          bookingsBySchedule[booking.schedule_id] = [];
        }
        bookingsBySchedule[booking.schedule_id].push(booking.seat_number);
      });

      // Build response with availability for each schedule
      const schedulesWithAvailability = schedules.map(schedule => {
        const bus = schedule.bus as any;
        const bookedSeats = bookingsBySchedule[schedule.id] || [];
        const totalSeats = bus.total_seats;
        const availableSeats = totalSeats - bookedSeats.length;

        return {
          schedule_id: schedule.id,
          departure_time: schedule.departure_time,
          arrival_time: schedule.arrival_time,
          price: schedule.price,
          bus: {
            id: bus.id,
            plate_number: bus.plate_number,
            bus_type: bus.bus_type,
            total_seats: totalSeats,
          },
          route: schedule.route,
          availability: {
            total_seats: totalSeats,
            available_seats: availableSeats,
            occupied_seats: bookedSeats.length,
            booked_seats: bookedSeats,
          },
        };
      });

      sendSuccess(res, {
        travel_date,
        schedules: schedulesWithAvailability,
      }, 'Schedules availability retrieved successfully');
    } catch (error: any) {
      logError('Get multiple schedules availability error', error);
      sendError(res, error.message || 'Failed to get schedules availability', 500);
    }
  }
}

