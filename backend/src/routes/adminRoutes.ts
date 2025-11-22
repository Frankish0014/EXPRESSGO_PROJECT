import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { AdminController } from '../controllers/adminController';

const router = Router();

router.get('/overview', authenticate, authorizeAdmin, AdminController.getOverview);

export default router;


