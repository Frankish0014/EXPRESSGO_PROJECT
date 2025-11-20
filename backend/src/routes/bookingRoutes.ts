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

// Round-trip booking validation
const roundTripValidation = [
  body('outbound.schedule_id').isInt({ min: 1 }).withMessage('Valid outbound schedule ID is required'),
  body('outbound.travel_date')
    .isDate()
    .withMessage('Valid outbound travel date is required')
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const travelDate = new Date(value);
      if (travelDate < today) {
        throw new Error('Outbound travel date cannot be in the past');
      }
      return true;
    }),
  body('outbound.seat_number').isInt({ min: 1 }).withMessage('Valid outbound seat number is required'),
  body('return.schedule_id').isInt({ min: 1 }).withMessage('Valid return schedule ID is required'),
  body('return.travel_date')
    .isDate()
    .withMessage('Valid return travel date is required')
    .custom((value, { req }) => {
      const outboundDate = new Date(req.body.outbound.travel_date);
      const returnDate = new Date(value);
      if (returnDate <= outboundDate) {
        throw new Error('Return date must be after outbound date');
      }
      return true;
    }),
  body('return.seat_number').isInt({ min: 1 }).withMessage('Valid return seat number is required'),
];

// Multi-city booking validation
const multiCityValidation = [
  body('legs').isArray({ min: 2, max: 5 }).withMessage('Multi-city booking requires 2-5 legs'),
  body('legs.*.schedule_id').isInt({ min: 1 }).withMessage('Valid schedule ID is required for each leg'),
  body('legs.*.travel_date')
    .isDate()
    .withMessage('Valid travel date is required for each leg'),
  body('legs.*.seat_number').isInt({ min: 1 }).withMessage('Valid seat number is required for each leg'),
  body('legs.*.sequence').isInt({ min: 1 }).withMessage('Valid sequence is required for each leg'),
];

const statusUpdateValidation = [
  body('status')
    .isIn(['confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be confirmed, cancelled, or completed'),
];

// User routes (authenticated)
router.post('/', authenticate, validate(bookingValidation), BookingController.createBooking);
router.post('/round-trip', authenticate, validate(roundTripValidation), BookingController.createRoundTripBooking);
router.post('/multi-city', authenticate, validate(multiCityValidation), BookingController.createMultiCityBooking);
router.get('/my-bookings', authenticate, BookingController.getMyBookings);
router.get('/code/:code', authenticate, BookingController.getBookingByCode);
router.get('/complete/:code', authenticate, BookingController.getCompleteBooking);
router.delete('/:code', authenticate, BookingController.cancelBooking);
router.delete('/complex/:code', authenticate, BookingController.cancelComplexBooking);

// Admin routes
router.get('/', authenticate, authorizeAdmin, BookingController.getAllBookings);
router.put('/:id/status', authenticate, authorizeAdmin, validate(statusUpdateValidation), BookingController.updateBookingStatus);

export default router;