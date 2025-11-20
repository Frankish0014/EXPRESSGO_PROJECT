import { Request, Response } from 'express';
import { ScheduleService } from '../services/scheduleService';

export class ScheduleController {
  static async getAllSchedules(_req: Request, res: Response): Promise<void> {
    try {
      const schedules = await ScheduleService.getAllSchedules();
      res.json({ schedules });
    } catch (error: any) {
      console.error('Get schedules error:', error);
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  }

  static async getScheduleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const schedule = await ScheduleService.getScheduleById(parseInt(id));
      res.json({ schedule });
    } catch (error: any) {
      console.error('Get schedule error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch schedule' });
    }
  }

  static async getSchedulesByRoute(req: Request, res: Response): Promise<void> {
    try {
      const { routeId } = req.params;
      const schedules = await ScheduleService.getSchedulesByRoute(parseInt(routeId));
      res.json({ schedules });
    } catch (error: any) {
      console.error('Get schedules by route error:', error);
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  }

  static async getAvailableSeats(req: Request, res: Response): Promise<void> {
    try {
      const { scheduleId } = req.params;
      const { travel_date } = req.query;

      if (!travel_date) {
        res.status(400).json({ error: 'Travel date is required' });
        return;
      }

      const result = await ScheduleService.getAvailableSeats(
        parseInt(scheduleId),
        travel_date as string
      );

      res.json(result);
    } catch (error: any) {
      console.error('Get available seats error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch available seats' });
    }
  }

  static async createSchedule(req: Request, res: Response): Promise<void> {
    try {
      const {
        bus_id,
        route_id,
        departure_time,
        arrival_time,
        price,
        available_days,
        is_active,
      } = req.body;

      const schedule = await ScheduleService.createSchedule({
        bus_id,
        route_id,
        departure_time,
        arrival_time,
        price,
        available_days,
        is_active,
      });

      res.status(201).json({
        message: 'Schedule created successfully',
        schedule,
      });
    } catch (error: any) {
      console.error('Create schedule error:', error);
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  }

  static async updateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { departure_time, arrival_time, price, is_active } = req.body;

      const schedule = await ScheduleService.updateSchedule(parseInt(id), {
        departure_time,
        arrival_time,
        price,
        is_active,
      });

      res.json({
        message: 'Schedule updated successfully',
        schedule,
      });
    } catch (error: any) {
      console.error('Update schedule error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  }

  static async deleteSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ScheduleService.deleteSchedule(parseInt(id));
      res.json(result);
    } catch (error: any) {
      console.error('Delete schedule error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  }

  static async searchSchedules(req: Request, res: Response): Promise<void> {
    try {
      const departure = (req.query.departure as string | undefined)?.trim();
      const arrival = (req.query.arrival as string | undefined)?.trim();
      const travelDate = (req.query.travel_date as string | undefined)?.trim();

      if (!departure && !arrival) {
        res.status(400).json({ error: 'Provide at least departure or arrival city to search schedules' });
        return;
      }

      const schedules = await ScheduleService.searchSchedules({
        departure,
        arrival,
        travelDate,
      });

      res.json({ schedules });
    } catch (error: any) {
      console.error('Search schedules error:', error);
      res.status(500).json({ error: 'Failed to search schedules' });
    }
  }
}