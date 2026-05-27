import { Router } from 'express';
import * as ContactController from '../controllers/contact.controller';

const router = Router();

router.post('/', ContactController.submitContact);

export default router;