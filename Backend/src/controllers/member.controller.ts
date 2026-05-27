import { Response, NextFunction } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import * as MemberModel from '../models/member.model';

export async function getAllMembers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const members = await MemberModel.getAllMembers();
    res.status(200).json({ members });
  } catch (err) { next(err); }
}

export async function getMemberById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const member = await MemberModel.getMemberById(id);
    if (!member) { res.status(404).json({ message: 'Member not found' }); return; }
    res.status(200).json({ member });
  } catch (err) { next(err); }
}

export async function createMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, position, specialty, role, link } = req.body;
    if (!name || !position || !specialty || !role) { res.status(400).json({ message: 'name, position, specialty and role are required' }); return; }
    const image = req.file ? `uploads/members/${req.file.filename}` : null;
    const member = await MemberModel.createMember(name, position, specialty, role, link ?? null, image);
    res.status(201).json({ message: 'Member created successfully', member });
  } catch (err) { next(err); }
}

export async function updateMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { name, position, specialty, role, link } = req.body;
    const existing = await MemberModel.getMemberById(id);
    if (!existing) { res.status(404).json({ message: 'Member not found' }); return; }
    if (req.file && existing.image) {
      if (fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    }
    const image = req.file ? `uploads/members/${req.file.filename}` : existing.image;
    const member = await MemberModel.updateMember(id, name ?? existing.name, position ?? existing.position, specialty ?? existing.specialty, role ?? existing.role, link ?? existing.link, image);
    res.status(200).json({ message: 'Member updated successfully', member });
  } catch (err) { next(err); }
}

export async function deleteMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const existing = await MemberModel.getMemberById(id);
    if (!existing) { res.status(404).json({ message: 'Member not found' }); return; }
    if (existing.image && fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    await MemberModel.deleteMember(id);
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (err) { next(err); }
}