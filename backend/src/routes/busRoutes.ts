import { Router } from 'express';
import { body } from 'express-validator';
import { BusController } from '../controllers/busController';
import { BusCompanyController } from '../controllers/busCompanyController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Bus validation
const busValidation = [
  body('bus_company_id').isInt({ min: 1 }).withMessage('Bus company ID is required'),
  body('plate_number').notEmpty().withMessage('Plate number is required').trim(),
  body('bus_type').notEmpty().withMessage('Bus type is required').trim(),
  body('total_seats').isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
  body('status').optional().isIn(['active', 'inactive', 'maintenance']).withMessage('Invalid status'),
];

// Bus Company validation
const busCompanyValidation = [
  body('name').notEmpty().withMessage('Company name is required').trim(),
  body('contact_phone').optional().trim(),
  body('contact_email').optional().isEmail().withMessage('Invalid email format'),
];

// Public routes
router.get('/', BusController.getAllBuses);
router.get('/:id', BusController.getBusById);
router.get('/company/:companyId', BusController.getBusesByCompany);

// Bus Company routes
router.get('/companies/all', BusCompanyController.getAllBusCompanies);
router.get('/companies/:id', BusCompanyController.getBusCompanyById);

// Admin routes - Bus Companies
router.post('/companies', authenticate, authorizeAdmin, validate(busCompanyValidation), BusCompanyController.createBusCompany);
router.put('/companies/:id', authenticate, authorizeAdmin, validate(busCompanyValidation), BusCompanyController.updateBusCompany);
router.delete('/companies/:id', authenticate, authorizeAdmin, BusCompanyController.deleteBusCompany);

// Admin routes - Buses
router.post('/', authenticate, authorizeAdmin, validate(busValidation), BusController.createBus);
router.put('/:id', authenticate, authorizeAdmin, validate(busValidation), BusController.updateBus);
router.delete('/:id', authenticate, authorizeAdmin, BusController.deleteBus);

export default router;

