import { Request, Response } from 'express';
import BusSchedule from '../models/BusSchedule';
import Bus from '../models/Bus';
import Route from '../models/Route';
import { sendSuccess, sendError, sendCreated } from '../utils/responseUtils';
import { logError } from '../utils/loggerUtils';
import { Op } from 'sequelize';

export class ScheduleController {
  // Create a new schedule
  static async createSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { bus_id, route_id, departure_time, arrival_time, price, available_days, is_active } = req.body;

      // Validate required fields
      if (!bus_id || !route_id || !departure_time || !arrival_time || !price) {
        sendError(res, 'Bus ID, route ID, departure time, arrival time, and price are required', 400);
        return;
      }

      // Verify bus exists
      const bus = await Bus.findByPk(bus_id);
      if (!bus) {
        sendError(res, 'Bus not found', 404);
        return;
      }

      // Verify route exists
      const route = await Route.findByPk(route_id);
      if (!route) {
        sendError(res, 'Route not found', 404);
        return;
      }

      const schedule = await BusSchedule.create({
        bus_id,
        route_id,
        departure_time,
        arrival_time,
        price,
        available_days,
        is_active: is_active !== undefined ? is_active : true,
      });

      // Include related data in response
      const scheduleWithRelations = await BusSchedule.findByPk(schedule.id, {
        include: [
          { model: Bus, as: 'bus' },
          { model: Route, as: 'route' },
        ],
      });

      sendCreated(res, { schedule: scheduleWithRelations }, 'Schedule created successfully');
    } catch (error: any) {
      logError('Create schedule error', error);
      sendError(res, error.message || 'Failed to create schedule', 500);
    }
  }

  // Get all schedules
  static async getAllSchedules(req: Request, res: Response): Promise<void> {
    try {
      const { route_id, is_active } = req.query;

      const where: any = {};
      if (route_id) where.route_id = route_id;
      if (is_active !== undefined) where.is_active = is_active === 'true';

      const schedules = await BusSchedule.findAll({
        where,
        include: [
          { model: Bus, as: 'bus' },
          { model: Route, as: 'route' },
        ],
        order: [['departure_time', 'ASC']],
      });

      sendSuccess(res, { schedules }, 'Schedules retrieved successfully');
    } catch (error: any) {
      logError('Get schedules error', error);
      sendError(res, error.message || 'Failed to retrieve schedules', 500);
    }
  }

  // Get schedule by ID
  static async getScheduleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const schedule = await BusSchedule.findByPk(id, {
        include: [
          { model: Bus, as: 'bus' },
          { model: Route, as: 'route' },
        ],
      });

      if (!schedule) {
        sendError(res, 'Schedule not found', 404);
        return;
      }

      sendSuccess(res, { schedule }, 'Schedule retrieved successfully');
    } catch (error: any) {
      logError('Get schedule error', error);
      sendError(res, error.message || 'Failed to retrieve schedule', 500);
    }
  }

  // Update schedule
  static async updateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { bus_id, route_id, departure_time, arrival_time, price, available_days, is_active } = req.body;

      const schedule = await BusSchedule.findByPk(id);

      if (!schedule) {
        sendError(res, 'Schedule not found', 404);
        return;
      }

      // Verify bus exists if provided
      if (bus_id) {
        const bus = await Bus.findByPk(bus_id);
        if (!bus) {
          sendError(res, 'Bus not found', 404);
          return;
        }
      }

      // Verify route exists if provided
      if (route_id) {
        const route = await Route.findByPk(route_id);
        if (!route) {
          sendError(res, 'Route not found', 404);
          return;
        }
      }

      // Update schedule
      if (bus_id !== undefined) schedule.bus_id = bus_id;
      if (route_id !== undefined) schedule.route_id = route_id;
      if (departure_time !== undefined) schedule.departure_time = departure_time;
      if (arrival_time !== undefined) schedule.arrival_time = arrival_time;
      if (price !== undefined) schedule.price = price;
      if (available_days !== undefined) schedule.available_days = available_days;
      if (is_active !== undefined) schedule.is_active = is_active;

      await schedule.save();

      // Include related data in response
      const scheduleWithRelations = await BusSchedule.findByPk(schedule.id, {
        include: [
          { model: Bus, as: 'bus' },
          { model: Route, as: 'route' },
        ],
      });

      sendSuccess(res, { schedule: scheduleWithRelations }, 'Schedule updated successfully');
    } catch (error: any) {
      logError('Update schedule error', error);
      sendError(res, error.message || 'Failed to update schedule', 500);
    }
  }

  // Get schedules by route
  static async getSchedulesByRoute(req: Request, res: Response): Promise<void> {
    try {
      const { route_id } = req.params;
      const { date } = req.query; // Optional: filter by date

      const schedules = await BusSchedule.findAll({
        where: {
          route_id,
          is_active: true,
        },
        include: [
          { model: Bus, as: 'bus' },
          { model: Route, as: 'route' },
        ],
        order: [['departure_time', 'ASC']],
      });

      sendSuccess(res, { schedules }, 'Schedules retrieved successfully');
    } catch (error: any) {
      logError('Get schedules by route error', error);
      sendError(res, error.message || 'Failed to retrieve schedules', 500);
    }
  }
}

