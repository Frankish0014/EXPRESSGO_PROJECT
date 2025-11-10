import { Router } from 'express';
import { query, body } from 'express-validator';
import { SeatAvailabilityController } from '../controllers/seatAvailabilityController';
import { validate } from '../middleware/validation';

const router = Router();

// Seat availability validation
const checkAvailabilityValidation = [
  query('schedule_id').isInt({ min: 1 }).withMessage('Valid schedule ID is required'),
  query('travel_date').isISO8601().withMessage('Valid travel date is required'),
];

const multipleSchedulesValidation = [
  body('schedule_ids').isArray({ min: 1 }).withMessage('Schedule IDs array is required'),
  body('schedule_ids.*').isInt({ min: 1 }).withMessage('Each schedule ID must be a valid integer'),
  body('travel_date').isISO8601().withMessage('Valid travel date is required'),
];

// Routes - Public (no authentication required for checking availability)
router.get('/check', validate(checkAvailabilityValidation), SeatAvailabilityController.checkSeatAvailability);
router.post('/multiple', validate(multipleSchedulesValidation), SeatAvailabilityController.getMultipleSchedulesAvailability);

export default router;

