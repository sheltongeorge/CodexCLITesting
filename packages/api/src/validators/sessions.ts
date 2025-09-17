import { z } from 'zod';

const coerceOptionalDate = z.preprocess((value) => {
  if (Array.isArray(value)) {
    value = value[0];
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.coerce.date().optional());

const nullableNonNegativeNumber = z.number().nonnegative().optional().or(z.literal(null));
const nullableRpe = z.number().min(1).max(10).optional().or(z.literal(null));

export const sessionIdParamSchema = z.object({
  id: z.string().cuid()
});

export const sessionListQuerySchema = z
  .object({
    from: coerceOptionalDate,
    to: coerceOptionalDate
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to;
      }
      return true;
    },
    {
      message: 'Query parameter "from" must be earlier than or equal to "to"',
      path: ['to']
    }
  );

export const exerciseSetSchema = z.object({
  exerciseName: z.string().min(1, 'Exercise name is required'),
  reps: z.number().int().positive(),
  weight: nullableNonNegativeNumber,
  rpe: nullableRpe,
  notes: z.string().optional()
});

export const createSessionSchema = z.object({
  workoutId: z.string().cuid(),
  date: z.coerce.date(),
  notes: z.string().optional(),
  exerciseSets: z.array(exerciseSetSchema).min(1, 'At least one exercise set is required')
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
