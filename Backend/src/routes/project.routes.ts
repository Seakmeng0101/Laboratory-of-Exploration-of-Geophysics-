import { Router } from 'express';
import * as ProjectController from '../controllers/project.controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadProject } from '../config/multer';
import { Role } from '../types/auth.types';

const router = Router();

router.get('/',    ProjectController.getAllProjects);
router.get('/:id', ProjectController.getProjectById);
router.post('/',      authenticate, authorize(Role.ADMIN, Role.MODERATOR), uploadProject.single('image'), ProjectController.createProject);
router.put('/:id',    authenticate, authorize(Role.ADMIN, Role.MODERATOR), uploadProject.single('image'), ProjectController.updateProject);
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.MODERATOR), ProjectController.deleteProject);

export default router;