import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  CreateSessionInput,
  createSessionSchema,
  sessionIdParamSchema,
  sessionListQuerySchema
} from '../validators/sessions';

const sessionsRouter = Router();

sessionsRouter.get(
  '/',
  validateQuery(sessionListQuerySchema),
  asyncHandler(async (req, res) => {
    const { from, to } = req.query as { from?: Date; to?: Date };

    const sessions = await prisma.workoutSession.findMany({
      where: {
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {})
              }
            }
          : {})
      },
      orderBy: { date: 'desc' },
      include: {
        workout: true,
        exerciseSets: true
      }
    });

    res.json(sessions);
  })
);

sessionsRouter.get(
  '/:id',
  validateParams(sessionIdParamSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    const session = await prisma.workoutSession.findUnique({
      where: { id },
      include: {
        workout: true,
        exerciseSets: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  })
);

sessionsRouter.post(
  '/',
  validateBody(createSessionSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as CreateSessionInput;

    const created = await prisma.workoutSession.create({
      data: {
        workoutId: data.workoutId,
        date: data.date,
        notes: data.notes,
        exerciseSets: {
          create: data.exerciseSets
        }
      },
      include: {
        exerciseSets: true,
        workout: true
      }
    });

    res.status(201).json(created);
  })
);

export { sessionsRouter };
