import { BusSchedule, Bus, Route, BusCompany, Booking } from '../models';

export class ScheduleService {
  static async getAllSchedules() {
    return await BusSchedule.findAll({
      where: { is_active: true },
      include: [
        {
          model: Bus,
          as: 'bus',
          attributes: ['plate_number', 'bus_type', 'total_seats'],
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
          attributes: [
            'departure_city',
            'arrival_city',
            'distance_km',
            'estimated_duration_minutes',
          ],
        },
      ],
      order: [
        [{ model: Route, as: 'route' }, 'departure_city', 'ASC'],
        ['departure_time', 'ASC'],
      ],
    });
  }

  static async getScheduleById(id: number) {
    const schedule = await BusSchedule.findByPk(id, {
      include: [
        {
          model: Bus,
          as: 'bus',
          attributes: ['plate_number', 'bus_type', 'total_seats'],
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
          attributes: [
            'departure_city',
            'arrival_city',
            'distance_km',
            'estimated_duration_minutes',
          ],
        },
      ],
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    return schedule;
  }

  static async getSchedulesByRoute(routeId: number) {
    return await BusSchedule.findAll({
      where: { route_id: routeId, is_active: true },
      include: [
        {
          model: Bus,
          as: 'bus',
          attributes: ['plate_number', 'bus_type', 'total_seats'],
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
          attributes: [
            'departure_city',
            'arrival_city',
            'distance_km',
            'estimated_duration_minutes',
          ],
        },
      ],
      order: [['departure_time', 'ASC']],
    });
  }

  static async getAvailableSeats(scheduleId: number, travelDate: string) {
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

  static async createSchedule(scheduleData: {
    bus_id: number;
    route_id: number;
    departure_time: string;
    arrival_time: string;
    price: number;
    available_days?: string;
    is_active?: boolean;
  }) {
    const schedule = await BusSchedule.create(scheduleData);
    return schedule;
  }

  static async updateSchedule(
    id: number,
    updateData: {
      departure_time?: string;
      arrival_time?: string;
      price?: number;
      is_active?: boolean;
    }
  ) {
    const schedule = await BusSchedule.findByPk(id);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    await schedule.update(updateData);
    return schedule;
  }

  static async deleteSchedule(id: number) {
    const schedule = await BusSchedule.findByPk(id);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    await schedule.destroy();
    return { message: 'Schedule deleted successfully' };
  }
}