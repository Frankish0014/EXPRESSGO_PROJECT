import { Request, Response } from "express";
import { BusService } from "../services/busService";

export class BusController {
  static async getAllBuses(_req: Request, res: Response): Promise<void> {
    try {
      const buses = await BusService.getAllBuses();
      res.json({ buses });
    } catch (error: any) {
      console.error("Get buses error:", error);
      res.status(500).json({ error: "Failed to fetch buses" });
    }
  }

  static async getBusById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bus = await BusService.getBusById(parseInt(id));
      res.json({ bus });
    } catch (error: any) {
      console.error("Get bus error:", error);
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Failed to fetch bus" });
    }
  }

  static async getBusesByCompany(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const buses = await BusService.getBusesByCompany(parseInt(companyId));
      res.json({ buses });
    } catch (error: any) {
      console.error("Get buses by company error:", error);
      res.status(500).json({ error: "Failed to fetch buses" });
    }
  }

  static async createBus(req: Request, res: Response): Promise<void> {
    try {
      const { bus_company_id, plate_number, bus_type, total_seats, status } =
        req.body;

      const bus = await BusService.createBus({
        bus_company_id,
        plate_number,
        bus_type,
        total_seats,
        status,
      });

      res.status(201).json({
        message: "Bus created successfully",
        bus,
      });
    } catch (error: any) {
      console.error("Create bus error:", error);
      if (
        error.message.includes("not found") ||
        error.message.includes("already exists")
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message || "Failed to create bus" });
    }
  }

  static async updateBus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { plate_number, bus_type, total_seats, status } = req.body;

      const bus = await BusService.updateBus(parseInt(id), {
        plate_number,
        bus_type,
        total_seats,
        status,
      });

      res.json({
        message: "Bus updated successfully",
        bus,
      });
    } catch (error: any) {
      console.error("Update bus error:", error);
      if (
        error.message.includes("not found") ||
        error.message.includes("already exists")
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message || "Failed to update bus" });
    }
  }

  static async deleteBus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await BusService.deleteBus(parseInt(id));
      res.json(result);
    } catch (error: any) {
      console.error("Delete bus error:", error);
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message || "Failed to delete bus" });
    }
  }
}
