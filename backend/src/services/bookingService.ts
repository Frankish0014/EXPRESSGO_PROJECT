import { Booking, BusSchedule, User, Bus, BusCompany, Route } from '../models';
import { EmailService, BookingEmailData, BookingCancellationEmailData } from './emailService';
import { logInfo, logError, logSuccess } from '../utils/loggerUtils';

export class BookingService {
  /**
   * Create a new booking with email notifications
   */
  static async createBooking(
    userId: number,
    bookingData: {
      schedule_id: number;
      travel_date: Date;
      seat_number: number;
    }
  ) {
    const { schedule_id, travel_date, seat_number } = bookingData;

    logInfo(`Creating booking for user ${userId}, schedule ${schedule_id}, seat ${seat_number}`);

    // Validate schedule exists and get all details
    const schedule = await BusSchedule.findByPk(schedule_id, {
      include: [
        {
          model: Bus,
          as: 'bus',
          attributes: ['total_seats', 'plate_number', 'bus_type'],
          include: [
            {
              model: BusCompany,
              as: 'company',
              attributes: ['name'],
            },
          ],
        },
        {
          model: Route,
          as: 'route',
          attributes: ['departure_city', 'arrival_city', 'distance_km', 'estimated_duration_minutes'],
        },
      ],
    });

    if (!schedule) {
      logError(`Schedule ${schedule_id} not found`);
      throw new Error('Schedule not found');
    }

    const scheduleData: any = schedule;

    // Check if seat is available
    const existingBooking = await Booking.findOne({
      where: {
        schedule_id,
        travel_date,
        seat_number,
        status: 'confirmed',
      },
    });

    if (existingBooking) {
      logError(`Seat ${seat_number} already booked for schedule ${schedule_id} on ${travel_date}`);
      throw new Error('Seat is not available');
    }

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate booking code
    const tempBookingCode = `T${Date.now()}`;
    const booking = await Booking.create({
      user_id: userId,
      schedule_id,
      travel_date,
      seat_number,
      status: 'confirmed',
      booking_code: tempBookingCode,
    });

    // Generate final booking code
    const finalBookingCode = this.generateEnhancedBookingCode(booking.id);
    await booking.update({ booking_code: finalBookingCode });

    logSuccess(`Booking created: ${finalBookingCode} for user ${userId}`);

    // Get full booking details
    const fullBooking = await this.getBookingById(booking.id);

    // ==================== SEND EMAIL NOTIFICATION ====================
    
    try {
      const emailData: BookingEmailData = {
        passengerName: user.full_name,
        passengerEmail: user.email,
        bookingCode: finalBookingCode,
        travelDate: travel_date.toString(),
        departureCity: scheduleData.route.departure_city,
        arrivalCity: scheduleData.route.arrival_city,
        departureTime: scheduleData.departure_time,
        arrivalTime: scheduleData.arrival_time,
        busCompany: scheduleData.bus.company.name,
        plateNumber: scheduleData.bus.plate_number,
        seatNumber: seat_number,
        price: parseFloat(scheduleData.price),
        distance: scheduleData.route.distance_km,
        duration: scheduleData.route.estimated_duration_minutes,
      };

      await EmailService.sendBookingConfirmation(emailData);
      logSuccess(`Booking confirmation email sent to ${user.email}`);
    } catch (error) {
      logError('Failed to send booking confirmation email', error);
    }

    return fullBooking;
  }

  /**
   * Cancel booking with email notifications
   */
  static async cancelBooking(userId: number, code: string) {
    logInfo(`Cancelling booking ${code} for user ${userId}`);
    
    const booking = await Booking.findOne({
      where: {
        booking_code: code,
        user_id: userId,
        status: 'confirmed',
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'email'],
        },
        {
          model: BusSchedule,
          as: 'schedule',
          include: [
            {
              model: Bus,
              as: 'bus',
              attributes: ['total_seats'],
            },
            {
              model: Route,
              as: 'route',
              attributes: ['departure_city', 'arrival_city'],
            },
          ],
        },
      ],
    });

    if (!booking) {
      logError(`Booking not found or already cancelled: ${code}`);
      throw new Error('Booking not found or already cancelled');
    }

    await booking.update({ status: 'cancelled' });
    logSuccess(`Booking cancelled: ${code}`);

    const bookingData: any = booking;

    // ==================== SEND EMAIL NOTIFICATION ====================
    
    try {
      const emailData: BookingCancellationEmailData = {
        passengerName: bookingData.user.full_name,
        passengerEmail: bookingData.user.email,
        bookingCode: code,
        travelDate: booking.travel_date.toString(),
        departureCity: bookingData.schedule.route.departure_city,
        arrivalCity: bookingData.schedule.route.arrival_city,
      };

      await EmailService.sendBookingCancellation(emailData);
      logSuccess(`Cancellation email sent to ${bookingData.user.email}`);
    } catch (error) {
      logError('Failed to send cancellation email', error);
    }

    return booking;
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(
    id: number,
    status: 'confirmed' | 'cancelled' | 'completed'
  ) {
    logInfo(`Updating booking ${id} status to ${status}`);
    
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: BusSchedule,
          as: 'schedule',
          include: [
            {
              model: Route,
              as: 'route',
              attributes: ['departure_city', 'arrival_city'],
            },
          ],
        },
      ],
    });

    if (!booking) {
      logError(`Booking not found: ${id}`);
      throw new Error('Booking not found');
    }

    const oldStatus = booking.status;
    await booking.update({ status });
    logSuccess(`Booking ${id} status updated from ${oldStatus} to ${status}`);

    return booking;
  }

  /**
   * Get user bookings
   */
  static async getUserBookings(userId: number) {
    logInfo(`Fetching bookings for user ${userId}`);
    
    return await Booking.findAll({
      where: { user_id: userId },
      include: [
        {
          model: BusSchedule,
          as: 'schedule',
          include: [
            {
              model: Bus,
              as: 'bus',
              attributes: ['plate_number', 'bus_type'],
              include: [
                {
                  model: BusCompany,
                  as: 'company',
                  attributes: ['name'],
                },
              ],
            },
            {
              model: Route,
              as: 'route',
              attributes: ['departure_city', 'arrival_city'],
            },
          ],
        },
      ],
      order: [['travel_date', 'DESC'], ['created_at', 'DESC']],
    });
  }

  /**
   * Get booking by code
   */
  static async getBookingByCode(code: string) {
    logInfo(`Fetching booking by code: ${code}`);
    
    const booking = await Booking.findOne({
      where: { booking_code: code },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'email', 'phone_number'],
        },
        {
          model: BusSchedule,
          as: 'schedule',
          include: [
            {
              model: Bus,
              as: 'bus',
              attributes: ['plate_number', 'bus_type'],
              include: [
                {
                  model: BusCompany,
                  as: 'company',
                  attributes: ['name'],
                },
              ],
            },
            {
              model: Route,
              as: 'route',
              attributes: ['departure_city', 'arrival_city'],
            },
          ],
        },
      ],
    });

    if (!booking) {
      logError(`Booking not found: ${code}`);
      throw new Error('Booking not found');
    }

    return booking;
  }

  /**
   * Get all bookings (admin)
   */
  static async getAllBookings() {
    logInfo('Fetching all bookings');
    
    return await Booking.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'email', 'phone_number'],
        },
        {
          model: BusSchedule,
          as: 'schedule',
          include: [
            {
              model: Bus,
              as: 'bus',
              attributes: ['plate_number', 'bus_type'],
              include: [
                {
                  model: BusCompany,
                  as: 'company',
                  attributes: ['name'],
                },
              ],
            },
            {
              model: Route,
              as: 'route',
              attributes: ['departure_city', 'arrival_city'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  // ==================== PRIVATE HELPER METHODS ====================
  
  private static generateEnhancedBookingCode(bookingId: number): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let random = '';
    for (let i = 0; i < 4; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const paddedId = bookingId.toString().padStart(6, '0');
    return `BK${year}${month}${day}${hour}${minute}${random}${paddedId}`;
  }

  private static async getBookingById(id: number) {
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'email', 'phone_number'],
        },
        {
          model: BusSchedule,
          as: 'schedule',
          include: [
            {
              model: Bus,
              as: 'bus',
              attributes: ['plate_number', 'bus_type'],
              include: [
                {
                  model: BusCompany,
                  as: 'company',
                  attributes: ['name'],
                },
              ],
            },
            {
              model: Route,
              as: 'route',
              attributes: ['departure_city', 'arrival_city'],
            },
          ],
        },
      ],
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  public static async getAvailableSeatsForSchedule(
    scheduleId: number,
    travelDate: string
  ) {
    const schedule = await BusSchedule.findByPk(scheduleId, {
      include: [
        {
          model: Bus,
          as: 'bus',
          attributes: ['total_seats'],
        },
      ],
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const bookedSeats = await Booking.findAll({
      where: {
        schedule_id: scheduleId,
        travel_date: travelDate,
        status: 'confirmed',
      },
      attributes: ['seat_number'],
    });

    const booked = bookedSeats.map((b) => b.seat_number);
    const totalSeats = (schedule as any).bus.total_seats;
    const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
    const availableSeats = allSeats.filter((seat) => !booked.includes(seat));

    return {
      schedule_id: scheduleId,
      travel_date: travelDate,
      available_seats: availableSeats,
      total_available: availableSeats.length,
    };
  }
}