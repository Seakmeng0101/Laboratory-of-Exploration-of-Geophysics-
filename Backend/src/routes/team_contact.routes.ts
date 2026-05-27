import { Router } from 'express';
import * as TeamContactController from '../controllers/team_contact.controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadTeamContact } from '../config/multer';
import { Role } from '../types/auth.types';

const router = Router();

router.get('/',    TeamContactController.getAllTeamContacts);
router.get('/:id', TeamContactController.getTeamContactById);
router.post('/',      authenticate, authorize(Role.ADMIN, Role.MODERATOR), uploadTeamContact.single('image'), TeamContactController.createTeamContact);
router.put('/:id',    authenticate, authorize(Role.ADMIN, Role.MODERATOR), uploadTeamContact.single('image'), TeamContactController.updateTeamContact);
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.MODERATOR), TeamContactController.deleteTeamContact);

export default router;