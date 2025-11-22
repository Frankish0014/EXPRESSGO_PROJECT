import { Request, Response } from 'express';
import { RouteService } from '../services/routeService';

export class RouteController {
  static async getAllRoutes(_req: Request, res: Response): Promise<void> {
    try {
      const routes = await RouteService.getAllRoutes();
      res.json({ routes });
    } catch (error: any) {
      console.error('Get routes error:', error);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  }

  static async getRouteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const route = await RouteService.getRouteById(parseInt(id));
      res.json({ route });
    } catch (error: any) {
      console.error('Get route error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch route' });
    }
  }

  static async getRoutesByDeparture(req: Request, res: Response): Promise<void> {
    try {
      const { departure } = req.params;
      const routes = await RouteService.getRoutesByDeparture(departure);
      res.json({ routes });
    } catch (error: any) {
      console.error('Get routes by departure error:', error);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  }

  static async createRoute(req: Request, res: Response): Promise<void> {
    try {
      const { departure_city, arrival_city, distance_km, estimated_duration_minutes } = req.body;

      const route = await RouteService.createRoute({
        departure_city,
        arrival_city,
        distance_km,
        estimated_duration_minutes,
      });

      res.status(201).json({
        message: 'Route created successfully',
        route,
      });
    } catch (error: any) {
      console.error('Create route error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ error: 'Route already exists' });
        return;
      }
      res.status(500).json({ error: 'Failed to create route' });
    }
  }

  static async updateRoute(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { departure_city, arrival_city, distance_km, estimated_duration_minutes } = req.body;

      const route = await RouteService.updateRoute(parseInt(id), {
        departure_city,
        arrival_city,
        distance_km,
        estimated_duration_minutes,
      });

      res.json({
        message: 'Route updated successfully',
        route,
      });
    } catch (error: any) {
      console.error('Update route error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to update route' });
    }
  }

  static async deleteRoute(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await RouteService.deleteRoute(parseInt(id));
      res.json(result);
    } catch (error: any) {
      console.error('Delete route error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to delete route' });
    }
  }

  static async searchRoutes(req: Request, res: Response): Promise<void> {
    try {
      const departure = (req.query.departure as string | undefined)?.trim();
      const arrival = (req.query.arrival as string | undefined)?.trim();

      if (!departure && !arrival) {
        res.status(400).json({ error: 'Provide departure or arrival city to search' });
        return;
      }

      const routes = await RouteService.searchRoutes({
        departure_city: departure,
        arrival_city: arrival,
      });

      res.json({ routes });
    } catch (error: any) {
      console.error('Search routes error:', error);
      res.status(500).json({ error: 'Failed to search routes' });
    }
  }
}