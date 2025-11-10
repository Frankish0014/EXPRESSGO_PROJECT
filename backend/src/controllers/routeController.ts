import { Request, Response } from 'express';
import Route from '../models/Route';
import { sendSuccess, sendError, sendCreated } from '../utils/responseUtils';
import { logError } from '../utils/loggerUtils';

export class RouteController {
  // Create a new route
  static async createRoute(req: Request, res: Response): Promise<void> {
    try {
      const { departure_city, arrival_city, distance_km, estimated_duration_minutes } = req.body;

      // Validate required fields
      if (!departure_city || !arrival_city) {
        sendError(res, 'Departure city and arrival city are required', 400);
        return;
      }

      // Check if route already exists
      const existingRoute = await Route.findOne({
        where: {
          departure_city,
          arrival_city,
        },
      });

      if (existingRoute) {
        sendError(res, 'Route already exists', 400);
        return;
      }

      const route = await Route.create({
        departure_city,
        arrival_city,
        distance_km,
        estimated_duration_minutes,
      });

      sendCreated(res, { route }, 'Route created successfully');
    } catch (error: any) {
      logError('Create route error', error);
      sendError(res, error.message || 'Failed to create route', 500);
    }
  }

  // Get all routes
  static async getAllRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = await Route.findAll({
        order: [['created_at', 'DESC']],
      });

      sendSuccess(res, { routes }, 'Routes retrieved successfully');
    } catch (error: any) {
      logError('Get routes error', error);
      sendError(res, error.message || 'Failed to retrieve routes', 500);
    }
  }

  // Get route by ID
  static async getRouteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const route = await Route.findByPk(id);

      if (!route) {
        sendError(res, 'Route not found', 404);
        return;
      }

      sendSuccess(res, { route }, 'Route retrieved successfully');
    } catch (error: any) {
      logError('Get route error', error);
      sendError(res, error.message || 'Failed to retrieve route', 500);
    }
  }

  // Update route
  static async updateRoute(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { departure_city, arrival_city, distance_km, estimated_duration_minutes } = req.body;

      const route = await Route.findByPk(id);

      if (!route) {
        sendError(res, 'Route not found', 404);
        return;
      }

      // Check if updating to an existing route (excluding current route)
      if (departure_city && arrival_city) {
        const existingRoute = await Route.findOne({
          where: {
            departure_city,
            arrival_city,
          },
        });

        if (existingRoute && existingRoute.id !== parseInt(id)) {
          sendError(res, 'Route with these cities already exists', 400);
          return;
        }
      }

      // Update route
      if (departure_city) route.departure_city = departure_city;
      if (arrival_city) route.arrival_city = arrival_city;
      if (distance_km !== undefined) route.distance_km = distance_km;
      if (estimated_duration_minutes !== undefined) route.estimated_duration_minutes = estimated_duration_minutes;

      await route.save();

      sendSuccess(res, { route }, 'Route updated successfully');
    } catch (error: any) {
      logError('Update route error', error);
      sendError(res, error.message || 'Failed to update route', 500);
    }
  }

  // Delete route (optional - not in requirements but useful)
  static async deleteRoute(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const route = await Route.findByPk(id);

      if (!route) {
        sendError(res, 'Route not found', 404);
        return;
      }

      await route.destroy();

      sendSuccess(res, {}, 'Route deleted successfully');
    } catch (error: any) {
      logError('Delete route error', error);
      sendError(res, error.message || 'Failed to delete route', 500);
    }
  }
}

