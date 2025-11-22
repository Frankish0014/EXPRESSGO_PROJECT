import { Bus, BusCompany } from '../models';

export class BusService {
  static async getAllBuses() {
    return await Bus.findAll({
      include: [
        {
          model: BusCompany,
          as: 'company',
          attributes: ['id', 'name'],
        },
      ],
      attributes: ['id', 'plate_number', 'bus_type', 'total_seats', 'status'],
      order: [['plate_number', 'ASC']],
    });
  }
}

