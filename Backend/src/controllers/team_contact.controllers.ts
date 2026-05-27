import { Response, NextFunction } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import * as TeamContactModel from '../models/team_contact.model';

export async function getAllTeamContacts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const teamContacts = await TeamContactModel.getAllTeamContacts();
    res.status(200).json({ teamContacts });
  } catch (err) { next(err); }
}

export async function getTeamContactById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const teamContact = await TeamContactModel.getTeamContactById(id);
    if (!teamContact) { res.status(404).json({ message: 'Team contact not found' }); return; }
    res.status(200).json({ teamContact });
  } catch (err) { next(err); }
}

export async function createTeamContact(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, faculty, institute, address, email, tel } = req.body;
    if (!name || !faculty || !institute || !address || !email || !tel) {
      res.status(400).json({ message: 'name, faculty, institute, address, email and tel are required' });
      return;
    }
    const image = req.file ? `uploads/team_contacts/${req.file.filename}` : null;
    const teamContact = await TeamContactModel.createTeamContact(name, faculty, institute, address, email, tel, image);
    res.status(201).json({ message: 'Team contact created successfully', teamContact });
  } catch (err) { next(err); }
}

export async function updateTeamContact(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { name, faculty, institute, address, email, tel } = req.body;
    const existing = await TeamContactModel.getTeamContactById(id);
    if (!existing) { res.status(404).json({ message: 'Team contact not found' }); return; }
    if (req.file && existing.image) {
      if (fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    }
    const image = req.file ? `uploads/team_contacts/${req.file.filename}` : existing.image;
    const teamContact = await TeamContactModel.updateTeamContact(id, name ?? existing.name, faculty ?? existing.faculty, institute ?? existing.institute, address ?? existing.address, email ?? existing.email, tel ?? existing.tel, image);
    res.status(200).json({ message: 'Team contact updated successfully', teamContact });
  } catch (err) { next(err); }
}

export async function deleteTeamContact(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const existing = await TeamContactModel.getTeamContactById(id);
    if (!existing) { res.status(404).json({ message: 'Team contact not found' }); return; }
    if (existing.image && fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    await TeamContactModel.deleteTeamContact(id);
    res.status(200).json({ message: 'Team contact deleted successfully' });
  } catch (err) { next(err); }
}