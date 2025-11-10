import { Router } from 'express';
import { body } from 'express-validator';
import { BookingController } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Booking validation
const createBookingValidation = [
  body('schedule_id').isInt({ min: 1 }).withMessage('Valid schedule ID is required'),
  body('travel_date').isISO8601().withMessage('Valid travel date is required'),
  body('seat_number').isInt({ min: 1 }).withMessage('Valid seat number is required'),
];

// Routes - All require authentication
router.post('/', authenticate, validate(createBookingValidation), BookingController.createBooking);
router.get('/', authenticate, BookingController.getUserBookings);
router.get('/:id', authenticate, BookingController.getBookingById);
router.put('/:id/cancel', authenticate, BookingController.cancelBooking);

export default router;

