import { Router } from 'express';
import { BusController } from '../controllers/busController';

const router = Router();

// Public routes
router.get('/', BusController.getAllBuses);

export default router;

