import { Router } from 'express';
import { body } from 'express-validator';
import { ScheduleController } from '../controllers/scheduleController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Schedule validation
const scheduleValidation = [
  body('bus_id').isInt({ min: 1 }).withMessage('Valid bus ID is required'),
  body('route_id').isInt({ min: 1 }).withMessage('Valid route ID is required'),
  body('departure_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Valid departure time is required (HH:MM)'),
  body('arrival_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Valid arrival time is required (HH:MM)'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('available_days').optional().isString(),
  body('is_active').optional().isBoolean(),
];

const scheduleUpdateValidation = [
  body('departure_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Valid departure time is required'),
  body('arrival_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Valid arrival time is required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('is_active').optional().isBoolean(),
];

// Public routes
router.get('/', ScheduleController.getAllSchedules);
router.get('/:id', ScheduleController.getScheduleById);
router.get('/route/:routeId', ScheduleController.getSchedulesByRoute);
router.get('/:scheduleId/available-seats', ScheduleController.getAvailableSeats);

// Admin routes
router.post('/', authenticate, authorizeAdmin, validate(scheduleValidation), ScheduleController.createSchedule);
router.put('/:id', authenticate, authorizeAdmin, validate(scheduleUpdateValidation), ScheduleController.updateSchedule);
router.delete('/:id', authenticate, authorizeAdmin, ScheduleController.deleteSchedule);

export default router;