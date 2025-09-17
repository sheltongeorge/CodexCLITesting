import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody, validateParams } from '../middleware/validate';
import { UpsertWorkoutInput, workoutIdParamSchema, upsertWorkoutSchema } from '../validators/workouts';

const workoutsRouter = Router();

workoutsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const workouts = await prisma.workout.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(workouts);
  })
);

workoutsRouter.get(
  '/:id',
  validateParams(workoutIdParamSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { date: 'desc' },
          include: {
            exerciseSets: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  })
);

workoutsRouter.post(
  '/',
  validateBody(upsertWorkoutSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as UpsertWorkoutInput;

    try {
      if (data.id) {
        const updated = await prisma.workout.update({
          where: { id: data.id },
          data: {
            name: data.name,
            description: data.description,
            defaultExercises: data.defaultExercises
          }
        });
        return res.status(200).json(updated);
      }

      const created = await prisma.workout.create({
        data: {
          name: data.name,
          description: data.description,
          defaultExercises: data.defaultExercises
        }
      });
      return res.status(201).json(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ message: 'Workout name already exists' });
      }
      throw error;
    }
  })
);

export { workoutsRouter };
