import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../types/auth.types';

const router = Router();

// Public
router.post('/login',           AuthController.login);
router.post('/verify-otp',      AuthController.verifyOtp);
router.post('/refresh',         AuthController.refresh);
router.post('/logout',          AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password',  AuthController.resetPassword);
router.get('/me',               authenticate, AuthController.me);

// Admin only
router.post('/register',    authenticate, authorize(Role.ADMIN), AuthController.register);
router.get('/users',        authenticate, authorize(Role.ADMIN), AuthController.getUsers);
router.delete('/users/:id', authenticate, authorize(Role.ADMIN), AuthController.deleteUser);

export default router;