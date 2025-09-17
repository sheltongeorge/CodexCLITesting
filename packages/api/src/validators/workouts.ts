import { z } from 'zod';

export const workoutIdParamSchema = z.object({
  id: z.string().cuid()
});

export const workoutExerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  notes: z.string().optional(),
  targetReps: z.number().int().positive(),
  targetWeight: z.number().nonnegative().optional(),
  restSeconds: z.number().int().nonnegative()
});

export const upsertWorkoutSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Workout name is required'),
  description: z.string().optional(),
  defaultExercises: z.array(workoutExerciseSchema).min(1, 'At least one exercise is required')
});

export type UpsertWorkoutInput = z.infer<typeof upsertWorkoutSchema>;
