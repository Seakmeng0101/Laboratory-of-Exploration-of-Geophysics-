import { Response, NextFunction } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import * as EquipmentModel from '../models/equipment.model';

export async function getAllEquipments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const equipments = await EquipmentModel.getAllEquipments();
    res.status(200).json({ equipments });
  } catch (err) { next(err); }
}

export async function getEquipmentById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const equipment = await EquipmentModel.getEquipmentById(id);
    if (!equipment) { res.status(404).json({ message: 'Equipment not found' }); return; }
    res.status(200).json({ equipment });
  } catch (err) { next(err); }
}

export async function createEquipment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { machine, model, capacity } = req.body;
    if (!machine || !model || !capacity) { res.status(400).json({ message: 'machine, model and capacity are required' }); return; }
    const image = req.file ? `uploads/equipments/${req.file.filename}` : null;
    const equipment = await EquipmentModel.createEquipment(machine, model, capacity, image);
    res.status(201).json({ message: 'Equipment created successfully', equipment });
  } catch (err) { next(err); }
}

export async function updateEquipment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { machine, model, capacity } = req.body;
    const existing = await EquipmentModel.getEquipmentById(id);
    if (!existing) { res.status(404).json({ message: 'Equipment not found' }); return; }
    if (req.file && existing.image) {
      if (fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    }
    const image = req.file ? `uploads/equipments/${req.file.filename}` : existing.image;
    const equipment = await EquipmentModel.updateEquipment(id, machine ?? existing.machine, model ?? existing.model, capacity ?? existing.capacity, image);
    res.status(200).json({ message: 'Equipment updated successfully', equipment });
  } catch (err) { next(err); }
}

export async function deleteEquipment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const existing = await EquipmentModel.getEquipmentById(id);
    if (!existing) { res.status(404).json({ message: 'Equipment not found' }); return; }
    if (existing.image && fs.existsSync(existing.image)) fs.unlinkSync(existing.image);
    await EquipmentModel.deleteEquipment(id);
    res.status(200).json({ message: 'Equipment deleted successfully' });
  } catch (err) { next(err); }
}