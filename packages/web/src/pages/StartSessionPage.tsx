import { useEffect, useMemo, useState } from 'react';
import { type Resolver, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSession } from '../api/sessions';
import { fetchWorkouts } from '../api/workouts';
import type { Workout } from '../api/types';

const exerciseSetSchema = z.object({
  exerciseName: z.string().min(1, 'Exercise name is required'),
  reps: z.number().int().positive(),
  weight: z.number().nonnegative().nullable().optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().optional()
});

const startSessionSchema = z.object({
  workoutId: z.string().min(1, 'Workout is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  exerciseSets: z.array(exerciseSetSchema).min(1, 'At least one set is required')
});

type StartSessionFormValues = z.infer<typeof startSessionSchema>;
type ExerciseSetForm = z.infer<typeof exerciseSetSchema>;

const startSessionResolver = zodResolver(startSessionSchema as any) as Resolver<StartSessionFormValues>;

const formatDateInput = (date: Date) => {
  const pad = (value: number) => `${value}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const createEmptySet = (): ExerciseSetForm => ({
  exerciseName: '',
  reps: 8,
  weight: null,
  rpe: null,
  notes: ''
});

export function StartSessionPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<StartSessionFormValues>({
    resolver: startSessionResolver,
    defaultValues: {
      workoutId: '',
      date: formatDateInput(new Date()),
      notes: '',
      exerciseSets: [createEmptySet()]
    }
  });

  const {
    fields,
    append,
    remove,
    replace
  } = useFieldArray({
    control: form.control,
    name: 'exerciseSets'
  });

  const selectedWorkoutId = form.watch('workoutId');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWorkouts();
        setWorkouts(data);
        if (data.length > 0) {
          form.setValue('workoutId', data[0].id, { shouldDirty: false, shouldTouch: false });
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load workouts');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [form]);

  useEffect(() => {
    if (!selectedWorkoutId) {
      return;
    }

    const workout = workouts.find((item) => item.id === selectedWorkoutId);
    if (!workout) {
      return;
    }

    const sets: ExerciseSetForm[] = workout.defaultExercises.length
      ? workout.defaultExercises.map((exercise) => ({
          exerciseName: exercise.name,
          reps: exercise.targetReps,
          weight: exercise.targetWeight ?? null,
          rpe: null,
          notes: exercise.notes ?? ''
        }))
      : [createEmptySet()];

    replace(sets);
  }, [selectedWorkoutId, workouts, replace]);

  const workoutOptions = useMemo(() => workouts.map((workout) => ({ value: workout.id, label: workout.name })), [workouts]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createSession({
        workoutId: values.workoutId,
        date: new Date(values.date),
        notes: values.notes?.trim() || null,
        exerciseSets: values.exerciseSets.map((set) => ({
          ...set,
          weight: Number.isFinite(set.weight) ? set.weight : null,
          rpe: Number.isFinite(set.rpe) ? set.rpe : null,
          notes: set.notes?.trim() || null
        }))
      });

      toast.success('Session recorded');

      const workout = workouts.find((item) => item.id === values.workoutId);
      const resetSets: ExerciseSetForm[] = workout?.defaultExercises.length
        ? workout.defaultExercises.map((exercise) => ({
            exerciseName: exercise.name,
            reps: exercise.targetReps,
            weight: exercise.targetWeight ?? null,
            rpe: null,
            notes: exercise.notes ?? ''
          }))
        : [createEmptySet()];

      form.reset({
        workoutId: values.workoutId,
        date: formatDateInput(new Date()),
        notes: '',
        exerciseSets: resetSets
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to record session');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Start Session</h1>
        {workoutOptions.length > 0 && (
          <span className="text-sm text-slate-400">{workoutOptions.length} saved workouts</span>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6 rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/40">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-200">Workout</label>
            <select
              {...form.register('workoutId')}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              disabled={loading}
            >
              <option value="">Select a workout</option>
              {workoutOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.formState.errors.workoutId && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.workoutId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Date &amp; Time</label>
            <input
              type="datetime-local"
              {...form.register('date')}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            {form.formState.errors.date && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.date.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200">Notes</label>
          <textarea
            rows={3}
            {...form.register('notes')}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Exercise Sets</h2>
            <button
              type="button"
              onClick={() => append(createEmptySet())}
              className="rounded-md border border-slate-700 px-3 py-1 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Add Set
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="rounded-md border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-200">Set {index + 1}</h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs font-medium text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400">Exercise</label>
                  <input
                    type="text"
                    {...form.register(`exerciseSets.${index}.exerciseName` as const)}
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  {form.formState.errors.exerciseSets?.[index]?.exerciseName && (
                    <p className="mt-1 text-xs text-red-400">
                      {form.formState.errors.exerciseSets?.[index]?.exerciseName?.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400">Weight (lb)</label>
                  <input
                    type="number"
                    step="0.5"
                    {...form.register(`exerciseSets.${index}.weight` as const, { valueAsNumber: true })}
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400">Reps</label>
                  <input
                    type="number"
                    {...form.register(`exerciseSets.${index}.reps` as const, { valueAsNumber: true })}
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  {form.formState.errors.exerciseSets?.[index]?.reps && (
                    <p className="mt-1 text-xs text-red-400">
                      {form.formState.errors.exerciseSets?.[index]?.reps?.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400">RPE</label>
                  <input
                    type="number"
                    step="0.5"
                    {...form.register(`exerciseSets.${index}.rpe` as const, { valueAsNumber: true })}
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  {form.formState.errors.exerciseSets?.[index]?.rpe && (
                    <p className="mt-1 text-xs text-red-400">
                      {form.formState.errors.exerciseSets?.[index]?.rpe?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-400">Notes</label>
                <textarea
                  rows={2}
                  {...form.register(`exerciseSets.${index}.notes` as const)}
                  className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving…' : 'Record Session'}
          </button>
        </div>
      </form>
    </div>
  );
}
