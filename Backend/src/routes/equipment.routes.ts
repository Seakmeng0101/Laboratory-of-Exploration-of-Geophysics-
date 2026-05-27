import { Router } from 'express';
import * as EquipmentController from '../controllers/equipment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadEquipment } from '../config/multer';
import { Role } from '../types/auth.types';

const router = Router();

router.get('/',    EquipmentController.getAllEquipments);
router.get('/:id', EquipmentController.getEquipmentById);
router.post('/',      authenticate, authorize(Role.ADMIN, Role.MODERATOR), uploadEquipment.single('image'), EquipmentController.createEquipment);
router.put('/:id',    authenticate, authorize(Role.ADMIN, Role.MODERATOR), uploadEquipment.single('image'), EquipmentController.updateEquipment);
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.MODERATOR), EquipmentController.deleteEquipment);

export default router;