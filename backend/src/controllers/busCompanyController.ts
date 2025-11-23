import { Request, Response } from 'express';
import { BusCompanyService } from '../services/busCompanyService';

export class BusCompanyController {
  static async getAllBusCompanies(_req: Request, res: Response): Promise<void> {
    try {
      const companies = await BusCompanyService.getAllBusCompanies();
      res.json({ companies });
    } catch (error: any) {
      console.error('Get bus companies error:', error);
      res.status(500).json({ error: 'Failed to fetch bus companies' });
    }
  }

  static async getBusCompanyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const company = await BusCompanyService.getBusCompanyById(parseInt(id));
      res.json({ company });
    } catch (error: any) {
      console.error('Get bus company error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch bus company' });
    }
  }

  static async createBusCompany(req: Request, res: Response): Promise<void> {
    try {
      const { name, contact_phone, contact_email } = req.body;

      const company = await BusCompanyService.createBusCompany({
        name,
        contact_phone,
        contact_email,
      });

      res.status(201).json({
        message: 'Bus company created successfully',
        company,
      });
    } catch (error: any) {
      console.error('Create bus company error:', error);
      res.status(500).json({ error: error.message || 'Failed to create bus company' });
    }
  }

  static async updateBusCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, contact_phone, contact_email } = req.body;

      const company = await BusCompanyService.updateBusCompany(parseInt(id), {
        name,
        contact_phone,
        contact_email,
      });

      res.json({
        message: 'Bus company updated successfully',
        company,
      });
    } catch (error: any) {
      console.error('Update bus company error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message || 'Failed to update bus company' });
    }
  }

  static async deleteBusCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await BusCompanyService.deleteBusCompany(parseInt(id));
      res.json(result);
    } catch (error: any) {
      console.error('Delete bus company error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('existing buses')) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message || 'Failed to delete bus company' });
    }
  }
}

