import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import authRouter from './routes/auth.route';
import serviceRouter from './routes/service.routes';
import memberRouter from './routes/member.routes';
import teamRouter from './routes/team.routes';
import projectRouter from './routes/project.routes';
import equipmentRouter from './routes/equipment.routes';
import contactRouter from './routes/contact.routes';
import teamContactRouter from './routes/team_contact.routes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',          authRouter);
app.use('/api/services',      serviceRouter);
app.use('/api/members',       memberRouter);
app.use('/api/teams',         teamRouter);
app.use('/api/projects',      projectRouter);
app.use('/api/equipments',    equipmentRouter);
app.use('/api/contact',       contactRouter);
app.use('/api/team-contacts', teamContactRouter);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Backend is running!' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});