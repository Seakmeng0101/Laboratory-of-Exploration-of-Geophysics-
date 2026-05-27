import { Response, NextFunction } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import * as ProjectModel from '../models/project.model';

export async function getAllProjects(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projects = await ProjectModel.getAllProjects();
    res.status(200).json({ projects });
  } catch (err) { next(err); }
}

export async function getProjectById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const project = await ProjectModel.getProjectById(id);
    if (!project) { res.status(404).json({ message: 'Project not found' }); return; }
    res.status(200).json({ project });
  } catch (err) { next(err); }
}

export async function createProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, description } = req.body;
    if (!title || !description) { res.status(400).json({ message: 'title and description are required' }); return; }
    let descriptionArray: string[];
    if (Array.isArray(description)) {
      descriptionArray = description;
    } else {
      try { descriptionArray = JSON.parse(description); }
      catch { descriptionArray = [description]; }
    }
    const image = req.file ? `uploads/projects/${req.file.filename}` : null;
    const project = await ProjectModel.createProject(title, descriptionArray, image);
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err) { next(err); }
}

export async function updateProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { title, description } = req.body;
    const existing = await ProjectModel.getProjectById(id);
    if (!existing) { res.status(404).json({ message: 'Project not found' }); return; }
    if (req.file && existing.image) {
      if (fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    }
    let descriptionArray: string[] = existing.description;
    if (description) {
      if (Array.isArray(description)) descriptionArray = description;
      else { try { descriptionArray = JSON.parse(description); } catch { descriptionArray = [description]; } }
    }
    const image = req.file ? `uploads/projects/${req.file.filename}` : existing.image;
    const project = await ProjectModel.updateProject(id, title ?? existing.title, descriptionArray, image);
    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (err) { next(err); }
}

export async function deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const existing = await ProjectModel.getProjectById(id);
    if (!existing) { res.status(404).json({ message: 'Project not found' }); return; }
    if (existing.image && fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    await ProjectModel.deleteProject(id);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) { next(err); }
}