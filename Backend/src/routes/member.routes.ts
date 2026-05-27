import { Router } from 'express';
import * as MemberController from '../controllers/member.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadMember } from '../config/multer';
import { Role } from '../types/auth.types';

const router = Router();

router.get('/',    MemberController.getAllMembers);
router.get('/:id', MemberController.getMemberById);
router.post('/',      authenticate, authorize(Role.ADMIN, Role.MODERATOR), uploadMember.single('image'), MemberController.createMember);
router.put('/:id',    authenticate, authorize(Role.ADMIN, Role.MODERATOR), uploadMember.single('image'), MemberController.updateMember);
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.MODERATOR), MemberController.deleteMember);

export default router;