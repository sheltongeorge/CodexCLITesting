import cors from 'cors';
import express from 'express';
import { allowedOrigins } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { sessionsRouter } from './routes/sessions';
import { workoutsRouter } from './routes/workouts';

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: false
  })
);

app.use(express.json());

app.use('/api/workouts', workoutsRouter);
app.use('/api/sessions', sessionsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use(errorHandler);

export { app };
