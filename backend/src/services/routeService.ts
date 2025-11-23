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
    // Normalize city names: trim and capitalize first letter
    const normalizeCityName = (city: string): string => {
      return city.trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const normalizedDeparture = normalizeCityName(routeData.departure_city);
    const normalizedArrival = normalizeCityName(routeData.arrival_city);

    // Check if route already exists (case-insensitive)
    const existingRoute = await Route.findOne({
      where: {
        departure_city: { [Op.iLike]: normalizedDeparture },
        arrival_city: { [Op.iLike]: normalizedArrival },
      },
    });

    if (existingRoute) {
      throw new Error(`Route from ${existingRoute.departure_city} to ${existingRoute.arrival_city} already exists`);
    }

    // Create route with normalized city names
    const route = await Route.create({
      ...routeData,
      departure_city: normalizedDeparture,
      arrival_city: normalizedArrival,
    });
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

    // Normalize city names if provided
    const normalizeCityName = (city: string): string => {
      return city.trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const normalizedUpdateData = { ...updateData };
    
    if (updateData.departure_city) {
      normalizedUpdateData.departure_city = normalizeCityName(updateData.departure_city);
    }
    
    if (updateData.arrival_city) {
      normalizedUpdateData.arrival_city = normalizeCityName(updateData.arrival_city);
    }

    // If updating cities, check for duplicates (excluding current route)
    if (normalizedUpdateData.departure_city || normalizedUpdateData.arrival_city) {
      const finalDeparture = normalizedUpdateData.departure_city || route.departure_city;
      const finalArrival = normalizedUpdateData.arrival_city || route.arrival_city;

      const existingRoute = await Route.findOne({
        where: {
          id: { [Op.ne]: id },
          departure_city: { [Op.iLike]: finalDeparture },
          arrival_city: { [Op.iLike]: finalArrival },
        },
      });

      if (existingRoute) {
        throw new Error(`Route from ${existingRoute.departure_city} to ${existingRoute.arrival_city} already exists`);
      }
    }

    await route.update(normalizedUpdateData);
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
    // Normalize city names the same way they're stored
    const normalizeCityName = (city: string): string => {
      return city.trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const where: WhereOptions = {};

    if (filters.departure_city) {
      const normalizedDeparture = normalizeCityName(filters.departure_city);
      where.departure_city = { [Op.iLike]: normalizedDeparture };
    }

    if (filters.arrival_city) {
      const normalizedArrival = normalizeCityName(filters.arrival_city);
      where.arrival_city = { [Op.iLike]: normalizedArrival };
    }

    return await Route.findAll({
      where,
      order: [['departure_city', 'ASC'], ['arrival_city', 'ASC']],
    });
  }
}