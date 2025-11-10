import { Router } from 'express';
import { body } from 'express-validator';
import { ScheduleController } from '../controllers/scheduleController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Schedule validation
const createScheduleValidation = [
  body('bus_id').isInt({ min: 1 }).withMessage('Valid bus ID is required'),
  body('route_id').isInt({ min: 1 }).withMessage('Valid route ID is required'),
  body('departure_time').notEmpty().withMessage('Departure time is required'),
  body('arrival_time').notEmpty().withMessage('Arrival time is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('available_days').optional().isString().withMessage('Available days must be a string'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
];

const updateScheduleValidation = [
  body('bus_id').optional().isInt({ min: 1 }).withMessage('Valid bus ID is required'),
  body('route_id').optional().isInt({ min: 1 }).withMessage('Valid route ID is required'),
  body('departure_time').optional().notEmpty().withMessage('Departure time cannot be empty'),
  body('arrival_time').optional().notEmpty().withMessage('Arrival time cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('available_days').optional().isString().withMessage('Available days must be a string'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
];

// Routes - Admin only for create, update
router.post('/', authenticate, authorizeAdmin, validate(createScheduleValidation), ScheduleController.createSchedule);
router.get('/', ScheduleController.getAllSchedules); // Public
router.get('/:id', ScheduleController.getScheduleById); // Public
router.get('/route/:route_id', ScheduleController.getSchedulesByRoute); // Public
router.put('/:id', authenticate, authorizeAdmin, validate(updateScheduleValidation), ScheduleController.updateSchedule);

export default router;

