import { Request, Response } from "express";
import { TripService } from "../services/tripService";

export class TripController {
  static async getAllTrips(req: Request, res: Response): Promise<void> {
    try {
      const { schedule_id, trip_date, status, start_date, end_date } = req.query;

      const trips = await TripService.getAllTrips({
        schedule_id: schedule_id ? parseInt(schedule_id as string) : undefined,
        trip_date: trip_date as string | undefined,
        status: status as string | undefined,
        start_date: start_date as string | undefined,
        end_date: end_date as string | undefined,
      });

      res.json({ trips });
    } catch (error: any) {
      console.error("Get trips error:", error);
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  }

  static async getTripById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const trip = await TripService.getTripById(parseInt(id));
      res.json({ trip });
    } catch (error: any) {
      console.error("Get trip error:", error);
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  }

  static async createOrGetTrip(req: Request, res: Response): Promise<void> {
    try {
      const { schedule_id, trip_date } = req.body;

      if (!schedule_id || !trip_date) {
        res.status(400).json({ error: "schedule_id and trip_date are required" });
        return;
      }

      const trip = await TripService.createOrGetTrip(
        parseInt(schedule_id),
        trip_date
      );

      res.status(201).json({
        message: "Trip created or retrieved successfully",
        trip,
      });
    } catch (error: any) {
      console.error("Create/get trip error:", error);
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message || "Failed to create/get trip" });
    }
  }

  static async updateTripStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["scheduled", "in-progress", "completed", "cancelled"].includes(status)) {
        res.status(400).json({ error: "Valid status is required" });
        return;
      }

      const trip = await TripService.updateTripStatus(
        parseInt(id),
        status as "scheduled" | "in-progress" | "completed" | "cancelled"
      );

      res.json({
        message: "Trip status updated successfully",
        trip,
      });
    } catch (error: any) {
      console.error("Update trip status error:", error);
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message || "Failed to update trip status" });
    }
  }
}

