import { Op, WhereOptions } from "sequelize";
import { Trip, BusSchedule, Route, Bus, BusCompany, Booking, User } from "../models";

export class TripService {
  static async getAllTrips(filters?: {
    schedule_id?: number;
    trip_date?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const where: WhereOptions = {};

    if (filters?.schedule_id) {
      where.schedule_id = filters.schedule_id;
    }

    if (filters?.trip_date) {
      where.trip_date = filters.trip_date;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.start_date && filters?.end_date) {
      where.trip_date = {
        [Op.between]: [filters.start_date, filters.end_date],
      };
    }

    return await Trip.findAll({
      where,
      include: [
        {
          model: BusSchedule,
          as: "schedule",
          include: [
            {
              model: Route,
              as: "route",
              attributes: ["departure_city", "arrival_city", "distance_km", "estimated_duration_minutes"],
            },
            {
              model: Bus,
              as: "bus",
              attributes: ["plate_number", "bus_type", "total_seats"],
              include: [
                {
                  model: BusCompany,
                  as: "company",
                  attributes: ["name", "contact_phone", "contact_email"],
                },
              ],
            },
          ],
        },
        {
          model: Booking,
          as: "bookings",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["full_name", "email", "phone_number"],
            },
          ],
          required: false,
        },
      ],
      order: [["trip_date", "DESC"], ["departure_time", "ASC"]],
    });
  }

  static async getTripById(id: number) {
    const trip = await Trip.findByPk(id, {
      include: [
        {
          model: BusSchedule,
          as: "schedule",
          include: [
            {
              model: Route,
              as: "route",
              attributes: ["departure_city", "arrival_city", "distance_km", "estimated_duration_minutes"],
            },
            {
              model: Bus,
              as: "bus",
              attributes: ["plate_number", "bus_type", "total_seats"],
              include: [
                {
                  model: BusCompany,
                  as: "company",
                  attributes: ["name", "contact_phone", "contact_email"],
                },
              ],
            },
          ],
        },
        {
          model: Booking,
          as: "bookings",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["full_name", "email", "phone_number"],
            },
          ],
          order: [["seat_number", "ASC"]],
        },
      ],
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    return trip;
  }

  static async createOrGetTrip(scheduleId: number, tripDate: string) {
    // Check if trip already exists
    const existingTrip = await Trip.findOne({
      where: {
        schedule_id: scheduleId,
        trip_date: tripDate,
      },
    });

    if (existingTrip) {
      return existingTrip;
    }

    // Get schedule details
    const schedule = await BusSchedule.findByPk(scheduleId, {
      include: [
        {
          model: Bus,
          as: "bus",
          attributes: ["total_seats"],
        },
      ],
    });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    const totalSeats = (schedule as any).bus.total_seats;

    // Create new trip
    const trip = await Trip.create({
      schedule_id: scheduleId,
      trip_date: tripDate,
      departure_time: schedule.departure_time,
      arrival_time: schedule.arrival_time,
      total_seats: totalSeats,
      booked_seats: 0,
      status: "scheduled",
    });

    return await this.getTripById(trip.id);
  }

  static async updateTripBookedSeats(tripId: number) {
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    const bookedCount = await Booking.count({
      where: {
        trip_id: tripId,
        status: "confirmed",
      },
    });

    await trip.update({ booked_seats: bookedCount });
    return trip;
  }

  static async updateTripStatus(
    id: number,
    status: "scheduled" | "in-progress" | "completed" | "cancelled"
  ) {
    const trip = await Trip.findByPk(id);
    if (!trip) {
      throw new Error("Trip not found");
    }

    await trip.update({ status });
    return trip;
  }
}

