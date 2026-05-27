import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createStorage = (folder: string) => {
  const uploadDir = `uploads/${folder}`;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
};

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpeg, png, webp images are allowed'));
  }
};

export const uploadService      = multer({ storage: createStorage('services'),      fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadMember       = multer({ storage: createStorage('members'),       fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadTeam         = multer({ storage: createStorage('teams'),         fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadProject      = multer({ storage: createStorage('projects'),      fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadEquipment    = multer({ storage: createStorage('equipments'),    fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadTeamContact  = multer({ storage: createStorage('team_contacts'), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });