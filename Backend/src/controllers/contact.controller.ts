import { Request, Response, NextFunction } from 'express';
import * as ContactModel from '../models/contact.model';
import { sendContactEmail } from '../utils/email.util';

export async function submitContact(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: 'name, email, subject and message are required' });
      return;
    }
    await ContactModel.createContact(name, email, subject, message);
    await sendContactEmail(name, email, subject, message);
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) { next(err); }
}