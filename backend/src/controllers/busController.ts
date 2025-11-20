import { Request, Response } from 'express';
import { BusService } from '../services/busService';

export class BusController {
  static async getAllBuses(_req: Request, res: Response): Promise<void> {
    try {
      const buses = await BusService.getAllBuses();
      res.json({ buses });
    } catch (error: any) {
      console.error('Get buses error:', error);
      res.status(500).json({ error: 'Failed to fetch buses' });
    }
  }
}

