import { Router } from 'express';
import { body } from 'express-validator';
import { RouteController } from '../controllers/routeController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Route validation
const routeValidation = [
  body('departure_city').notEmpty().withMessage('Departure city is required').trim(),
  body('arrival_city').notEmpty().withMessage('Arrival city is required').trim(),
  body('distance_km').optional().isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
  body('estimated_duration_minutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
];

// Public routes
router.get('/', RouteController.getAllRoutes);
router.get('/search', RouteController.searchRoutes);
router.get('/departure/:departure', RouteController.getRoutesByDeparture);
router.get('/:id', RouteController.getRouteById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, validate(routeValidation), RouteController.createRoute);
router.put('/:id', authenticate, authorizeAdmin, validate(routeValidation), RouteController.updateRoute);
router.delete('/:id', authenticate, authorizeAdmin, RouteController.deleteRoute);

export default router;