import { Response, NextFunction } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import * as TeamModel from '../models/team.model';

export async function getAllTeams(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const teams = await TeamModel.getAllTeams();
    res.status(200).json({ teams });
  } catch (err) { next(err); }
}

export async function getTeamById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const team = await TeamModel.getTeamById(id);
    if (!team) { res.status(404).json({ message: 'Team not found' }); return; }
    res.status(200).json({ team });
  } catch (err) { next(err); }
}

export async function createTeam(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, position } = req.body;
    if (!name || !email || !position) { res.status(400).json({ message: 'name, email and position are required' }); return; }
    const image = req.file ? `uploads/teams/${req.file.filename}` : null;
    const team = await TeamModel.createTeam(name, email, position, image);
    res.status(201).json({ message: 'Team created successfully', team });
  } catch (err) { next(err); }
}

export async function updateTeam(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { name, email, position } = req.body;
    const existing = await TeamModel.getTeamById(id);
    if (!existing) { res.status(404).json({ message: 'Team not found' }); return; }
    if (req.file && existing.image) {
      if (fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    }
    const image = req.file ? `uploads/teams/${req.file.filename}` : existing.image;
    const team = await TeamModel.updateTeam(id, name ?? existing.name, email ?? existing.email, position ?? existing.position, image);
    res.status(200).json({ message: 'Team updated successfully', team });
  } catch (err) { next(err); }
}

export async function deleteTeam(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const existing = await TeamModel.getTeamById(id);
    if (!existing) { res.status(404).json({ message: 'Team not found' }); return; }
    if (existing.image && fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    await TeamModel.deleteTeam(id);
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (err) { next(err); }
}