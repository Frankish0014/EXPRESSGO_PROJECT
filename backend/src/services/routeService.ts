import { Op, WhereOptions } from 'sequelize';
import { Route } from '../models';

export class RouteService {
  static async getAllRoutes() {
    return await Route.findAll({
      order: [['departure_city', 'ASC'], ['arrival_city', 'ASC']],
    });
  }

  static async getRouteById(id: number) {
    const route = await Route.findByPk(id);
    if (!route) {
      throw new Error('Route not found');
    }
    return route;
  }

  static async getRoutesByDeparture(departureCity: string) {
    return await Route.findAll({
      where: { departure_city: departureCity },
      order: [['arrival_city', 'ASC']],
    });
  }

  static async createRoute(routeData: {
    departure_city: string;
    arrival_city: string;
    distance_km?: number;
    estimated_duration_minutes?: number;
  }) {
    const route = await Route.create(routeData);
    return route;
  }

  static async updateRoute(
    id: number,
    updateData: {
      departure_city?: string;
      arrival_city?: string;
      distance_km?: number;
      estimated_duration_minutes?: number;
    }
  ) {
    const route = await Route.findByPk(id);
    if (!route) {
      throw new Error('Route not found');
    }

    await route.update(updateData);
    return route;
  }

  static async deleteRoute(id: number) {
    const route = await Route.findByPk(id);
    if (!route) {
      throw new Error('Route not found');
    }

    await route.destroy();
    return { message: 'Route deleted successfully' };
  }

  static async searchRoutes(filters: {
    departure_city?: string;
    arrival_city?: string;
  }) {
    const where: WhereOptions = {};

    if (filters.departure_city) {
      where.departure_city = { [Op.iLike]: filters.departure_city };
    }

    if (filters.arrival_city) {
      where.arrival_city = { [Op.iLike]: filters.arrival_city };
    }

    return await Route.findAll({
      where,
      order: [['departure_city', 'ASC'], ['arrival_city', 'ASC']],
    });
  }
}