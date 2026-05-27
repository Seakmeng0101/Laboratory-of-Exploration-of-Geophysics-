import { Response, NextFunction } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import * as ServiceModel from '../models/service.model';

export async function getAllServices(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const services = await ServiceModel.getAllServices();
    res.status(200).json({ services });
  } catch (err) { next(err); }
}

export async function getServicesById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const service = await ServiceModel.getServiceById(id);
    if (!service) { res.status(404).json({ message: 'Service not found' }); return; }
    res.status(200).json({ service });
  } catch (err) { next(err); }
}

export async function createServices(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, description, link } = req.body;
    if (!title || !description) { res.status(400).json({ message: 'title and description are required' }); return; }
    const image = req.file ? `uploads/services/${req.file.filename}` : null;
    const service = await ServiceModel.createService(title, description, image, link ?? null);
    res.status(201).json({ message: 'Service created successfully', service });
  } catch (err) { next(err); }
}

export async function updateServices(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { title, description, link } = req.body;
    const existing = await ServiceModel.getServiceById(id);
    if (!existing) { res.status(404).json({ message: 'Service not found' }); return; }
    if (req.file && existing.image) {
      if (fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    }
    const image = req.file ? `uploads/services/${req.file.filename}` : existing.image;
    const service = await ServiceModel.updateService(id, title ?? existing.title, description ?? existing.description, image, link ?? existing.link);
    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (err) { next(err); }
}

export async function deleteServices(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const existing = await ServiceModel.getServiceById(id);
    if (!existing) { res.status(404).json({ message: 'Service not found' }); return; }
    if (existing.image && fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    await ServiceModel.deleteService(id);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (err) { next(err); }
}