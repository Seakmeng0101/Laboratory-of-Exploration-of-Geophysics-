import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware';
import * as UserModel from '../models/user.model';
import { sendResetEmail, sendOtpEmail } from '../utils/email.util';
import {
  signAccessToken,
  generateRefreshToken,
  refreshTokenExpiresAt,
} from '../utils/token.util';
import { Role } from '../types/auth.types';

export async function register(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({ message: 'name, email, password and confirmPassword are required' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Password and confirm password do not match' });
      return;
    }

    let assignedRole: Role = Role.MODERATOR;
    if (req.user?.role === Role.ADMIN) {
      if (role === Role.ADMIN) assignedRole = Role.ADMIN;
      else assignedRole = Role.MODERATOR;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user   = await UserModel.createUser(name, email.toLowerCase(), hashed, assignedRole);

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }
    next(err);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'email and password are required' });
      return;
    }

    const user = await UserModel.findUserByEmail(email.toLowerCase());
    if (!user || !user.is_active) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const expires   = new Date(Date.now() + 5 * 60 * 1000);
    const expiresAt = expires.toISOString().slice(0, 19).replace('T', ' ');

    await UserModel.saveOtp(user.id, otp, expiresAt);
    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { otp } = req.body;
    if (!otp) {
      res.status(400).json({ message: 'OTP is required' });
      return;
    }

    const user = await UserModel.findUserByOtp(otp);
    if (!user) {
      res.status(401).json({ message: 'Invalid or expired OTP' });
      return;
    }

    await UserModel.clearOtp(user.id);

    const payload      = { userId: user.id, email: user.email, role: user.role };
    const accessToken  = signAccessToken(payload);
    const refreshToken = generateRefreshToken();

    await UserModel.saveRefreshToken(user.id, refreshToken, refreshTokenExpiresAt());

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: 'refreshToken is required' });
      return;
    }

    const record = await UserModel.findRefreshToken(refreshToken);
    if (!record || !record.is_active) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }
    if (new Date(record.expires_at) < new Date()) {
      await UserModel.deleteRefreshToken(refreshToken);
      res.status(401).json({ message: 'Refresh token expired' });
      return;
    }

    await UserModel.deleteRefreshToken(refreshToken);

    const payload      = { userId: record.user_id, email: record.email, role: record.role };
    const accessToken  = signAccessToken(payload);
    const newRefresh   = generateRefreshToken();

    await UserModel.saveRefreshToken(record.user_id, newRefresh, refreshTokenExpiresAt());

    res.status(200).json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await UserModel.deleteRefreshToken(refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response) {
  res.status(200).json({ user: req.user });
}

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await UserModel.getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    const target = await UserModel.findUserById(id);
    if (!target) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (target.role === Role.ADMIN) {
      res.status(403).json({ message: 'Forbidden: cannot delete admin' });
      return;
    }

    await UserModel.deleteUser(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'email is required' });
      return;
    }

    const user = await UserModel.findUserByEmail(email.toLowerCase());
    if (!user) {
      res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
      return;
    }

    const token     = crypto.randomBytes(32).toString('hex');
    const expires   = new Date(Date.now() + 60 * 60 * 1000);
    const expiresAt = expires.toISOString().slice(0, 19).replace('T', ' ');

    await UserModel.saveResetToken(email.toLowerCase(), token, expiresAt);
    await sendResetEmail(email.toLowerCase(), token);

    res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) {
      res.status(400).json({ message: 'email, password and confirmPassword are required' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    const user = await UserModel.findUserByEmail(email.toLowerCase());
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    await UserModel.clearResetToken(user.id, hashed);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}
export async function resendOtp(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'email is required' });
      return;
    }

    const user = await UserModel.findUserByEmail(email.toLowerCase());
    if (!user || !user.is_active) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const otp     = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    const expiresAt = expires.toISOString().slice(0, 19).replace('T', ' ');

    await UserModel.saveOtp(user.id, otp, expiresAt);
    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: 'OTP resent to your email' });
  } catch (err) {
    next(err);
  }
}