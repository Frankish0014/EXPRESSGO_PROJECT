import { Request, Response } from 'express';
import Booking from '../models/Booking';
import BusSchedule from '../models/BusSchedule';
import Bus from '../models/Bus';
import Route from '../models/Route';
import User from '../models/User';
import { sendSuccess, sendError, sendCreated } from '../utils/responseUtils';
import { logError } from '../utils/loggerUtils';
import { Op } from 'sequelize';

export class BookingController {
  // Get user's bookings
  static async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const bookings = await Booking.findAll({
        where: { user_id: userId },
        include: [
          {
            model: BusSchedule,
            as: 'schedule',
            include: [
              { model: Bus, as: 'bus' },
              { model: Route, as: 'route' },
            ],
          },
          { model: User, as: 'user' },
        ],
        order: [['created_at', 'DESC']],
      });

      sendSuccess(res, { bookings }, 'Bookings retrieved successfully');
    } catch (error: any) {
      logError('Get user bookings error', error);
      sendError(res, error.message || 'Failed to retrieve bookings', 500);
    }
  }

  // Get booking by ID
  static async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const booking = await Booking.findOne({
        where: { id, user_id: userId },
        include: [
          {
            model: BusSchedule,
            as: 'schedule',
            include: [
              { model: Bus, as: 'bus' },
              { model: Route, as: 'route' },
            ],
          },
          { model: User, as: 'user' },
        ],
      });

      if (!booking) {
        sendError(res, 'Booking not found', 404);
        return;
      }

      sendSuccess(res, { booking }, 'Booking retrieved successfully');
    } catch (error: any) {
      logError('Get booking error', error);
      sendError(res, error.message || 'Failed to retrieve booking', 500);
    }
  }

  // Cancel booking
  static async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const booking = await Booking.findOne({
        where: { id, user_id: userId },
      });

      if (!booking) {
        sendError(res, 'Booking not found', 404);
        return;
      }

      if (booking.status === 'cancelled') {
        sendError(res, 'Booking is already cancelled', 400);
        return;
      }

      if (booking.status === 'completed') {
        sendError(res, 'Cannot cancel a completed booking', 400);
        return;
      }

      // Update booking status to cancelled
      booking.status = 'cancelled';
      await booking.save();

      // Get updated booking with relations
      const updatedBooking = await Booking.findByPk(booking.id, {
        include: [
          {
            model: BusSchedule,
            as: 'schedule',
            include: [
              { model: Bus, as: 'bus' },
              { model: Route, as: 'route' },
            ],
          },
          { model: User, as: 'user' },
        ],
      });

      sendSuccess(res, { booking: updatedBooking }, 'Booking cancelled successfully');
    } catch (error: any) {
      logError('Cancel booking error', error);
      sendError(res, error.message || 'Failed to cancel booking', 500);
    }
  }

  // Create booking (optional - for completeness)
  static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { schedule_id, travel_date, seat_number } = req.body;

      // Validate required fields
      if (!schedule_id || !travel_date || !seat_number) {
        sendError(res, 'Schedule ID, travel date, and seat number are required', 400);
        return;
      }

      // Verify schedule exists
      const schedule = await BusSchedule.findByPk(schedule_id, {
        include: [{ model: Bus, as: 'bus' }],
      });

      if (!schedule) {
        sendError(res, 'Schedule not found', 404);
        return;
      }

      if (!schedule.is_active) {
        sendError(res, 'Schedule is not active', 400);
        return;
      }

      const bus = schedule.bus as any;
      if (!bus) {
        sendError(res, 'Bus not found for this schedule', 404);
        return;
      }

      // Validate seat number
      if (seat_number < 1 || seat_number > bus.total_seats) {
        sendError(res, `Seat number must be between 1 and ${bus.total_seats}`, 400);
        return;
      }

      // Check if seat is already booked for this schedule and date
      const existingBooking = await Booking.findOne({
        where: {
          schedule_id,
          travel_date,
          seat_number,
          status: {
            [Op.not]: 'cancelled',
          },
        },
      });

      if (existingBooking) {
        sendError(res, 'Seat is already booked for this date', 400);
        return;
      }

      // Create booking
      const booking = await Booking.create({
        user_id: userId,
        schedule_id,
        travel_date,
        seat_number,
        status: 'confirmed',
      });

      // Get booking with relations
      const bookingWithRelations = await Booking.findByPk(booking.id, {
        include: [
          {
            model: BusSchedule,
            as: 'schedule',
            include: [
              { model: Bus, as: 'bus' },
              { model: Route, as: 'route' },
            ],
          },
          { model: User, as: 'user' },
        ],
      });

      sendCreated(res, { booking: bookingWithRelations }, 'Booking created successfully');
    } catch (error: any) {
      logError('Create booking error', error);
      sendError(res, error.message || 'Failed to create booking', 500);
    }
  }
}

