import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import authRouter from './routes/auth.route';

const app = express();

app.use(express.json());
app.use('/api/auth', authRouter);

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server on port ${process.env.PORT || 3000}`),
);