import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';

export class BookingController {
  static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { schedule_id, travel_date, seat_number } = req.body;

      const booking = await BookingService.createBooking(userId, {
        schedule_id,
        travel_date,
        seat_number,
      });

      res.status(201).json({
        message: 'Booking created successfully',
        booking,
      });
    } catch (error: any) {
      console.error('Create booking error:', error);
      if (error.name === 'SequelizeUniqueConstraintError' || error.message.includes('not available')) {
        res.status(400).json({ error: error.message || 'This seat is already booked' });
        return;
      }
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }

  static async getMyBookings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const bookings = await BookingService.getUserBookings(userId);
      res.json({ bookings });
    } catch (error: any) {
      console.error('Get bookings error:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  static async getBookingByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const booking = await BookingService.getBookingByCode(code);
      res.json({ booking });
    } catch (error: any) {
      console.error('Get booking error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch booking' });
    }
  }

  static async getAllBookings(_req: Request, res: Response): Promise<void> {
    try {
      const bookings = await BookingService.getAllBookings();
      res.json({ bookings });
    } catch (error: any) {
      console.error('Get all bookings error:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  static async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { code } = req.params;

      await BookingService.cancelBooking(userId, code);
      res.json({ message: 'Booking cancelled successfully' });
    } catch (error: any) {
      console.error('Cancel booking error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  }

  static async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const booking = await BookingService.updateBookingStatus(parseInt(id), status);

      res.json({
        message: 'Booking status updated successfully',
        booking,
      });
    } catch (error: any) {
      console.error('Update booking status error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  }
}