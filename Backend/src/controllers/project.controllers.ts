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
    const { title, company_title, description } = req.body;
    if (!title || !description) {
      res.status(400).json({ message: 'title and description are required' });
      return;
    }

    let descriptionArray: string[];
    if (Array.isArray(description)) {
      descriptionArray = description;
    } else {
      try { descriptionArray = JSON.parse(description); }
      catch { descriptionArray = [description]; }
    }

    // Handle multiple images
    const files = req.files as Express.Multer.File[];
    const images = files ? files.map(f => `uploads/projects/${f.filename}`) : [];

    const project = await ProjectModel.createProject(
      title,
      company_title ?? null,
      descriptionArray,
      images,
    );
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err) { next(err); }
}

export async function updateProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { title, company_title, description, removeImages } = req.body;

    const existing = await ProjectModel.getProjectById(id);
    if (!existing) { res.status(404).json({ message: 'Project not found' }); return; }

    let descriptionArray: string[] = existing.description;
    if (description) {
      if (Array.isArray(description)) descriptionArray = description;
      else {
        try { descriptionArray = JSON.parse(description); }
        catch { descriptionArray = [description]; }
      }
    }

    // Remove selected old images
    let existingImages: string[] = existing.images ?? [];
    if (removeImages) {
      const toRemove: string[] = Array.isArray(removeImages) ? removeImages : [removeImages];
      toRemove.forEach(img => {
        if (fs.existsSync(img)) fs.unlinkSync(img);
      });
      existingImages = existingImages.filter(img => !toRemove.includes(img));
    }

    // Add new images
    const files = req.files as Express.Multer.File[];
    const newImages = files ? files.map(f => `uploads/projects/${f.filename}`) : [];
    const images = [...existingImages, ...newImages];

    const project = await ProjectModel.updateProject(
      id,
      title ?? existing.title,
      company_title ?? existing.company_title,
      descriptionArray,
      images,
    );
    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (err) { next(err); }
}

export async function deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const existing = await ProjectModel.getProjectById(id);
    if (!existing) { res.status(404).json({ message: 'Project not found' }); return; }

    // Delete all images
    const images: string[] = existing.images ?? [];
    images.forEach(img => {
      if (fs.existsSync(img)) fs.unlinkSync(img);
    });

    await ProjectModel.deleteProject(id);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) { next(err); }
}