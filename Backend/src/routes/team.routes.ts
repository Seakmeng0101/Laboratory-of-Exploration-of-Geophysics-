import { Router } from 'express';
import * as TeamController from '../controllers/team.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadTeam } from '../config/multer';
import { Role } from '../types/auth.types';

const router = Router();

router.get('/',    authenticate, authorize(Role.ADMIN), TeamController.getAllTeams);
router.get('/:id', authenticate, authorize(Role.ADMIN), TeamController.getTeamById);
router.post('/',      authenticate, authorize(Role.ADMIN), uploadTeam.single('image'), TeamController.createTeam);
router.put('/:id',    authenticate, authorize(Role.ADMIN), uploadTeam.single('image'), TeamController.updateTeam);
router.delete('/:id', authenticate, authorize(Role.ADMIN), TeamController.deleteTeam);

export default router;