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
}