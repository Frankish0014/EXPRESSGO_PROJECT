import { Booking, BusSchedule, User, Bus, BusCompany, Route } from '../models';
import { EmailService, BookingEmailData, BookingCancellationEmailData } from './emailService';
import { logInfo, logError, logSuccess } from '../utils/loggerUtils';
import sequelize from '../config/database';
import { TripService } from './tripService';

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

    // Create or get trip for this schedule and date
    const trip = await TripService.createOrGetTrip(schedule_id, travel_date.toString());

    // Generate booking code
    const tempBookingCode = `T${Date.now()}`;
    const booking = await Booking.create({
      user_id: userId,
      schedule_id,
      trip_id: trip.id,
      travel_date,
      seat_number,
      status: 'confirmed',
      booking_type: 'one-way',
      booking_code: tempBookingCode,
    });

    // Generate final booking code
    const finalBookingCode = this.generateEnhancedBookingCode(booking.id);
    await booking.update({ booking_code: finalBookingCode });

    // Update trip booked seats count
    await TripService.updateTripBookedSeats(trip.id);

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
   * Create round-trip booking
   */
  static async createRoundTripBooking(
    userId: number,
    bookingData: {
      outbound: {
        schedule_id: number;
        travel_date: Date;
        seat_number: number;
      };
      return: {
        schedule_id: number;
        travel_date: Date;
        seat_number: number;
      };
    }
  ) {
    const transaction = await sequelize.transaction();

    try {
      logInfo(`Creating round-trip booking for user ${userId}`);

      // Validate return date is after outbound date
      const outboundDate = new Date(bookingData.outbound.travel_date);
      const returnDate = new Date(bookingData.return.travel_date);

      if (returnDate <= outboundDate) {
        throw new Error('Return date must be after departure date');
      }

      // Check if outbound seat is available
      const outboundExisting = await Booking.findOne({
        where: {
          schedule_id: bookingData.outbound.schedule_id,
          travel_date: bookingData.outbound.travel_date,
          seat_number: bookingData.outbound.seat_number,
          status: 'confirmed',
        },
        transaction,
      });

      if (outboundExisting) {
        throw new Error('Outbound seat is not available');
      }

      // Check if return seat is available
      const returnExisting = await Booking.findOne({
        where: {
          schedule_id: bookingData.return.schedule_id,
          travel_date: bookingData.return.travel_date,
          seat_number: bookingData.return.seat_number,
          status: 'confirmed',
        },
        transaction,
      });

      if (returnExisting) {
        throw new Error('Return seat is not available');
      }

      // Create or get trips for both legs
      const outboundTrip = await TripService.createOrGetTrip(
        bookingData.outbound.schedule_id,
        bookingData.outbound.travel_date.toString()
      );
      const returnTrip = await TripService.createOrGetTrip(
        bookingData.return.schedule_id,
        bookingData.return.travel_date.toString()
      );

      // Create outbound booking (parent)
      const tempCode = `T${Date.now()}`;
      const outboundBooking = await Booking.create(
        {
          user_id: userId,
          schedule_id: bookingData.outbound.schedule_id,
          trip_id: outboundTrip.id,
          travel_date: bookingData.outbound.travel_date,
          seat_number: bookingData.outbound.seat_number,
          status: 'confirmed',
          booking_type: 'round-trip',
          booking_code: tempCode,
          return_travel_date: bookingData.return.travel_date,
        },
        { transaction }
      );

      // Generate final booking code
      const finalCode = this.generateEnhancedBookingCode(outboundBooking.id);
      await outboundBooking.update({ booking_code: finalCode }, { transaction });

      // Create return booking (child)
      const returnBooking = await Booking.create(
        {
          user_id: userId,
          schedule_id: bookingData.return.schedule_id,
          trip_id: returnTrip.id,
          travel_date: bookingData.return.travel_date,
          seat_number: bookingData.return.seat_number,
          status: 'confirmed',
          booking_type: 'round-trip',
          booking_code: `${finalCode}-RTN`,
          parent_booking_id: outboundBooking.id,
        },
        { transaction }
      );

      // Update trip booked seats for both trips
      await TripService.updateTripBookedSeats(outboundTrip.id);
      await TripService.updateTripBookedSeats(returnTrip.id);

      await transaction.commit();

      logSuccess(`Round-trip booking created: ${finalCode} for user ${userId}`);

      // Get full booking details
      const fullOutbound = await this.getBookingById(outboundBooking.id);
      const fullReturn = await this.getBookingById(returnBooking.id);

      // Calculate total price
      const totalPrice =
        parseFloat((fullOutbound as any).schedule.price) + parseFloat((fullReturn as any).schedule.price);

      // Send email notification
      const user = await User.findByPk(userId);
      if (user) {
        try {
          const emailData: BookingEmailData = {
            passengerName: user.full_name,
            passengerEmail: user.email,
            bookingCode: finalCode,
            travelDate: `${bookingData.outbound.travel_date} to ${bookingData.return.travel_date}`,
            departureCity: (fullOutbound as any).schedule.route.departure_city,
            arrivalCity: (fullOutbound as any).schedule.route.arrival_city,
            departureTime: (fullOutbound as any).schedule.departure_time,
            arrivalTime: (fullReturn as any).schedule.arrival_time,
            busCompany: (fullOutbound as any).schedule.bus.company.name,
            plateNumber: (fullOutbound as any).schedule.bus.plate_number,
            seatNumber: bookingData.outbound.seat_number,
            price: totalPrice,
          };

          await EmailService.sendBookingConfirmation(emailData);
          logSuccess(`Round-trip booking confirmation email sent to ${user.email}`);
        } catch (error) {
          logError('Failed to send round-trip booking email', error);
        }
      }

      return {
        booking_code: finalCode,
        booking_type: 'round-trip' as const,
        outbound: fullOutbound,
        return: fullReturn,
        total_price: totalPrice,
      };
    } catch (error) {
      await transaction.rollback();
      logError('Round-trip booking creation failed', error);
      throw error;
    }
  }

  /**
   * Create multi-city booking
   */
  static async createMultiCityBooking(
    userId: number,
    bookingData: {
      legs: Array<{
        schedule_id: number;
        travel_date: Date;
        seat_number: number;
        sequence: number;
      }>;
    }
  ) {
    const transaction = await sequelize.transaction();

    try {
      logInfo(`Creating multi-city booking for user ${userId} with ${bookingData.legs.length} legs`);

      // Validate legs are in chronological order
      const sortedLegs = [...bookingData.legs].sort((a, b) => a.sequence - b.sequence);
      for (let i = 1; i < sortedLegs.length; i++) {
        const prevDate = new Date(sortedLegs[i - 1].travel_date);
        const currentDate = new Date(sortedLegs[i].travel_date);
        if (currentDate < prevDate) {
          throw new Error('Travel dates must be in chronological order');
        }
      }

      // Check if all seats are available
      for (const leg of sortedLegs) {
        const existingBooking = await Booking.findOne({
          where: {
            schedule_id: leg.schedule_id,
            travel_date: leg.travel_date,
            seat_number: leg.seat_number,
            status: 'confirmed',
          },
          transaction,
        });

        if (existingBooking) {
          throw new Error(`Seat ${leg.seat_number} is not available for leg ${leg.sequence}`);
        }
      }

      // Create or get trips for all legs
      const trips = await Promise.all(
        sortedLegs.map(leg =>
          TripService.createOrGetTrip(leg.schedule_id, leg.travel_date.toString())
        )
      );

      // Create parent booking (first leg)
      const firstLeg = sortedLegs[0];
      const tempCode = `T${Date.now()}`;
      const parentBooking = await Booking.create(
        {
          user_id: userId,
          schedule_id: firstLeg.schedule_id,
          trip_id: trips[0].id,
          travel_date: firstLeg.travel_date,
          seat_number: firstLeg.seat_number,
          status: 'confirmed',
          booking_type: 'multi-city',
          booking_code: tempCode,
          leg_sequence: 1,
        },
        { transaction }
      );

      // Generate final booking code
      const finalCode = this.generateEnhancedBookingCode(parentBooking.id);
      await parentBooking.update({ booking_code: finalCode }, { transaction });

      // Create child bookings for remaining legs
      const childBookings = [];
      for (let i = 1; i < sortedLegs.length; i++) {
        const leg = sortedLegs[i];
        const childBooking = await Booking.create(
          {
            user_id: userId,
            schedule_id: leg.schedule_id,
            trip_id: trips[i].id,
            travel_date: leg.travel_date,
            seat_number: leg.seat_number,
            status: 'confirmed',
            booking_type: 'multi-city',
            booking_code: `${finalCode}-L${i + 1}`,
            parent_booking_id: parentBooking.id,
            leg_sequence: i + 1,
          },
          { transaction }
        );
        childBookings.push(childBooking);
      }

      // Update trip booked seats for all trips
      await Promise.all(trips.map(trip => TripService.updateTripBookedSeats(trip.id)));

      await transaction.commit();

      logSuccess(`Multi-city booking created: ${finalCode} for user ${userId}`);

      // Get full booking details
      const allBookings = [
        await this.getBookingById(parentBooking.id),
        ...(await Promise.all(childBookings.map((b) => this.getBookingById(b.id)))),
      ];

      // Calculate total price
      const totalPrice = allBookings.reduce((sum, booking) => sum + parseFloat((booking as any).schedule.price), 0);

      // Send email notification
      const user = await User.findByPk(userId);
      if (user) {
        try {
          const emailData: BookingEmailData = {
            passengerName: user.full_name,
            passengerEmail: user.email,
            bookingCode: finalCode,
            travelDate: `Multi-city: ${allBookings.map((b: any) => b.travel_date).join(', ')}`,
            departureCity: (allBookings[0] as any).schedule.route.departure_city,
            arrivalCity: (allBookings[allBookings.length - 1] as any).schedule.route.arrival_city,
            departureTime: (allBookings[0] as any).schedule.departure_time,
            arrivalTime: (allBookings[allBookings.length - 1] as any).schedule.arrival_time,
            busCompany: `Multiple operators (${allBookings.length} legs)`,
            plateNumber: 'Multiple',
            seatNumber: 0,
            price: totalPrice,
          };

          await EmailService.sendBookingConfirmation(emailData);
          logSuccess(`Multi-city booking confirmation email sent to ${user.email}`);
        } catch (error) {
          logError('Failed to send multi-city booking email', error);
        }
      }

      return {
        booking_code: finalCode,
        booking_type: 'multi-city' as const,
        legs: allBookings,
        total_price: totalPrice,
      };
    } catch (error) {
      await transaction.rollback();
      logError('Multi-city booking creation failed', error);
      throw error;
    }
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

    // Update trip booked seats count if booking is linked to a trip
    if (booking.trip_id) {
      await TripService.updateTripBookedSeats(booking.trip_id);
    }

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
   * Cancel complex booking (round-trip or multi-city)
   */
  static async cancelComplexBooking(userId: number, code: string) {
    const transaction = await sequelize.transaction();

    try {
      logInfo(`Cancelling complex booking ${code} for user ${userId}`);

      // Find parent booking
      const parentBooking = await Booking.findOne({
        where: {
          booking_code: code,
          user_id: userId,
          status: 'confirmed',
        },
        include: [
          {
            model: Booking,
            as: 'childBookings',
            where: { status: 'confirmed' },
            required: false,
          },
        ],
        transaction,
      });

      if (!parentBooking) {
        throw new Error('Booking not found or already cancelled');
      }

      // Cancel parent booking
      await parentBooking.update({ status: 'cancelled' }, { transaction });

      // Cancel all child bookings
      const childBookings = (parentBooking as any).childBookings || [];
      for (const child of childBookings) {
        await child.update({ status: 'cancelled' }, { transaction });
      }

      await transaction.commit();

      // Update trip booked seats for all affected trips
      const tripIds = [
        parentBooking.trip_id,
        ...childBookings.map((child: any) => child.trip_id)
      ].filter(Boolean);

      await Promise.all(tripIds.map((tripId: number) => TripService.updateTripBookedSeats(tripId)));

      logSuccess(`Complex booking cancelled: ${code}`);

      // Send email notification
      const user = await User.findByPk(userId);
      if (user) {
        try {
          const emailData: BookingCancellationEmailData = {
            passengerName: user.full_name,
            passengerEmail: user.email,
            bookingCode: code,
            travelDate: `All ${childBookings.length + 1} legs cancelled`,
            departureCity: 'Multiple',
            arrivalCity: 'Multiple',
          };

          await EmailService.sendBookingCancellation(emailData);
          logSuccess(`Complex booking cancellation email sent to ${user.email}`);
        } catch (error) {
          logError('Failed to send complex booking cancellation email', error);
        }
      }

      return {
        message: 'Booking cancelled successfully',
        cancelled_bookings: [parentBooking, ...childBookings],
      };
    } catch (error) {
      await transaction.rollback();
      logError('Complex booking cancellation failed', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(id: number, status: 'confirmed' | 'cancelled' | 'completed') {
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

    // Update trip booked seats count if booking is linked to a trip
    // Only update if status changed between confirmed and other statuses
    if (booking.trip_id && (oldStatus === 'confirmed' || status === 'confirmed')) {
      await TripService.updateTripBookedSeats(booking.trip_id);
    }

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
   * Get complete booking with all legs
   */
  static async getCompleteBooking(code: string) {
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
        {
          model: Booking,
          as: 'childBookings',
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
        },
      ],
    });

    if (!booking) {
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

  public static async getAvailableSeatsForSchedule(scheduleId: number, travelDate: string) {
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