import { Router } from 'express';
import { body } from 'express-validator';
import { RouteController } from '../controllers/routeController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Route validation
const createRouteValidation = [
  body('departure_city').notEmpty().withMessage('Departure city is required').trim(),
  body('arrival_city').notEmpty().withMessage('Arrival city is required').trim(),
  body('distance_km').optional().isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
  body('estimated_duration_minutes').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
];

const updateRouteValidation = [
  body('departure_city').optional().notEmpty().withMessage('Departure city cannot be empty').trim(),
  body('arrival_city').optional().notEmpty().withMessage('Arrival city cannot be empty').trim(),
  body('distance_km').optional().isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
  body('estimated_duration_minutes').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
];

// Routes - Admin only for create, update, delete
router.post('/', authenticate, authorizeAdmin, validate(createRouteValidation), RouteController.createRoute);
router.get('/', RouteController.getAllRoutes); // Public
router.get('/:id', RouteController.getRouteById); // Public
router.put('/:id', authenticate, authorizeAdmin, validate(updateRouteValidation), RouteController.updateRoute);
router.delete('/:id', authenticate, authorizeAdmin, RouteController.deleteRoute);

export default router;

