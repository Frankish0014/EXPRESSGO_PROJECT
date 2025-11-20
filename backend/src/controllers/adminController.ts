import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

export class AdminController {
  static async getOverview(_req: Request, res: Response): Promise<void> {
    try {
      const overview = await AdminService.getOverview();
      res.json(overview);
    } catch (error: any) {
      console.error('Admin overview error:', error);
      res.status(500).json({ error: 'Failed to load admin overview data' });
    }
  }
}


