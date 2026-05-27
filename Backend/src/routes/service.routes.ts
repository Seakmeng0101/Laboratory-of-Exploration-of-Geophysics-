import { Router } from 'express';
import * as ServicesController from '../controllers/service.controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadService } from '../config/multer';
import { Role } from '../types/auth.types';

const router = Router();

router.get('/',    ServicesController.getAllServices);
router.get('/:id', ServicesController.getServicesById);
router.post('/',      authenticate, authorize(Role.ADMIN, Role.MODERATOR), uploadService.single('image'), ServicesController.createServices);
router.put('/:id',    authenticate, authorize(Role.ADMIN, Role.MODERATOR), uploadService.single('image'), ServicesController.updateServices);
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.MODERATOR), ServicesController.deleteServices);

export default router;