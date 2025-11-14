import { Router } from 'express';
import { body } from 'express-validator';
import { BookingController } from '../controllers/bookingController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Booking validation
const bookingValidation = [
  body('schedule_id').isInt({ min: 1 }).withMessage('Valid schedule ID is required'),
  body('travel_date')
    .isDate()
    .withMessage('Valid travel date is required (YYYY-MM-DD)')
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const travelDate = new Date(value);
      if (travelDate < today) {
        throw new Error('Travel date cannot be in the past');
      }
      return true;
    }),
  body('seat_number').isInt({ min: 1 }).withMessage('Valid seat number is required'),
];

const statusUpdateValidation = [
  body('status')
    .isIn(['confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be confirmed, cancelled, or completed'),
];

// User routes (authenticated)
router.post('/', authenticate, validate(bookingValidation), BookingController.createBooking);
router.get('/my-bookings', authenticate, BookingController.getMyBookings);
router.get('/code/:code', authenticate, BookingController.getBookingByCode);
router.delete('/:code', authenticate, BookingController.cancelBooking);

// Admin routes
router.get('/', authenticate, authorizeAdmin, BookingController.getAllBookings);
router.put('/:id/status', authenticate, authorizeAdmin, validate(statusUpdateValidation), BookingController.updateBookingStatus);

export default router;