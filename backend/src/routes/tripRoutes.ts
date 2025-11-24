import { Router } from "express";
import { TripController } from "../controllers/tripController";
import { authenticate, authorizeAdmin } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", TripController.getAllTrips);
router.get("/:id", TripController.getTripById);

// Admin routes
router.post("/", authenticate, authorizeAdmin, TripController.createOrGetTrip);
router.put("/:id/status", authenticate, authorizeAdmin, TripController.updateTripStatus);

export default router;

