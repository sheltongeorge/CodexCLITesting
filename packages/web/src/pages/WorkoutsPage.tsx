import { useEffect, useMemo, useState } from 'react';
import { type Resolver, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchWorkout, fetchWorkouts, upsertWorkout } from '../api/workouts';
import type { Workout, WorkoutExercise } from '../api/types';
import { formatRest } from '../lib/format';

const workoutExerciseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  notes: z.string().optional(),
  targetReps: z.number().int().positive(),
  targetWeight: z.number().nonnegative().nullable().optional(),
  restSeconds: z.number().int().nonnegative()
});

const workoutFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Workout name is required'),
  description: z.string().optional(),
  defaultExercises: z.array(workoutExerciseSchema).min(1, 'At least one exercise is required')
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;
type WorkoutExerciseForm = z.infer<typeof workoutExerciseSchema>;

const workoutResolver = zodResolver(workoutFormSchema as any) as Resolver<WorkoutFormValues>;

const createDefaultExercise = (): WorkoutExerciseForm => ({
  name: '',
  notes: '',
  targetReps: 8,
  targetWeight: null,
  restSeconds: 90
});

const normalizeExercise = (exercise: WorkoutExercise): WorkoutExerciseForm => ({
  name: exercise.name,
  notes: exercise.notes ?? '',
  targetReps: exercise.targetReps,
  targetWeight: exercise.targetWeight ?? null,
  restSeconds: exercise.restSeconds
});

export function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  const form = useForm<WorkoutFormValues>({
    resolver: workoutResolver,
    defaultValues: {
      name: '',
      description: '',
      defaultExercises: [createDefaultExercise()]
    }
  });

  const {
    fields: exerciseFields,
    append,
    remove,
    replace
  } = useFieldArray({
    control: form.control,
    name: 'defaultExercises'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWorkouts();
        setWorkouts(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load workouts');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleReset = () => {
    setSelectedWorkoutId(null);
    const defaults = [createDefaultExercise()];
    form.reset({
      id: undefined,
      name: '',
      description: '',
      defaultExercises: defaults
    });
    replace(defaults);
  };

  const handleEdit = async (id: string) => {
    try {
      setSelectedWorkoutId(id);
      const workout = await fetchWorkout(id);
      const normalized = workout.defaultExercises.map(normalizeExercise);
      form.reset({
        id: workout.id,
        name: workout.name,
        description: workout.description ?? '',
        defaultExercises: normalized
      });
      replace(normalized);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load workout');
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        id: values.id,
        name: values.name,
        description: values.description?.trim() || null,
        defaultExercises: values.defaultExercises.map((exercise) => ({
          name: exercise.name,
          notes: exercise.notes?.trim() || null,
          targetReps: exercise.targetReps,
          targetWeight: Number.isFinite(exercise.targetWeight) ? exercise.targetWeight : null,
          restSeconds: exercise.restSeconds
        }))
      };

      const result = await upsertWorkout(payload);

      setWorkouts((prev) => {
        const exists = prev.find((item) => item.id === result.id);
        if (exists) {
          return prev.map((item) => (item.id === result.id ? result : item));
        }
        return [result, ...prev];
      });

      const normalized = result.defaultExercises.map(normalizeExercise);
      toast.success(values.id ? 'Workout updated' : 'Workout created');
      form.reset({
        id: result.id,
        name: result.name,
        description: result.description ?? '',
        defaultExercises: normalized
      });
      replace(normalized);
      setSelectedWorkoutId(result.id);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save workout');
    }
  });

  const summary = useMemo(() => {
    if (exerciseFields.length === 0) {
      return null;
    }

    return exerciseFields.map((field, index) => {
      const exercise = form.watch(`defaultExercises.${index}`);
      return `${index + 1}. ${exercise?.name || 'Untitled'} (${formatRest(exercise?.restSeconds || 0)})`;
    });
  }, [exerciseFields, form]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr,1fr]">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Workouts</h1>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            New Workout
          </button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">Loading workouts…</div>
          ) : workouts.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
              No workouts yet. Use the form to create your first workout.
            </div>
          ) : (
            workouts.map((workout) => (
              <button
                key={workout.id}
                type="button"
                onClick={() => handleEdit(workout.id)}
                className={`w-full rounded-lg border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-slate-700 hover:bg-slate-800 ${
                  selectedWorkoutId === workout.id ? 'ring-2 ring-slate-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-slate-100">{workout.name}</h2>
                    {workout.description && <p className="text-sm text-slate-400">{workout.description}</p>}
                  </div>
                  <span className="text-sm text-slate-400">{workout.defaultExercises.length} exercises</span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/50">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-200">Name</label>
            <input
              type="text"
              {...form.register('name')}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Description</label>
            <textarea
              rows={3}
              {...form.register('description')}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-slate-100">Default Exercises</h2>
              <button
                type="button"
                onClick={() => append(createDefaultExercise())}
                className="rounded-md border border-slate-700 px-3 py-1 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Add Exercise
              </button>
            </div>

            {exerciseFields.map((field, index) => (
              <div key={field.id} className="rounded-md border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-200">Exercise {index + 1}</h3>
                  {exerciseFields.length > 1 && (
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
                    <label className="block text-xs font-medium text-slate-400">Name</label>
                    <input
                      type="text"
                      {...form.register(`defaultExercises.${index}.name` as const)}
                      className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                    {form.formState.errors.defaultExercises?.[index]?.name && (
                      <p className="mt-1 text-xs text-red-400">
                        {form.formState.errors.defaultExercises?.[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400">Target Weight (lb)</label>
                    <input
                      type="number"
                      step="0.5"
                      {...form.register(`defaultExercises.${index}.targetWeight` as const, { valueAsNumber: true })}
                      className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400">Target Reps</label>
                    <input
                      type="number"
                      {...form.register(`defaultExercises.${index}.targetReps` as const, { valueAsNumber: true })}
                      className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                    {form.formState.errors.defaultExercises?.[index]?.targetReps && (
                      <p className="mt-1 text-xs text-red-400">
                        {form.formState.errors.defaultExercises?.[index]?.targetReps?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400">Rest Seconds</label>
                    <input
                      type="number"
                      {...form.register(`defaultExercises.${index}.restSeconds` as const, { valueAsNumber: true })}
                      className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                    {form.formState.errors.defaultExercises?.[index]?.restSeconds && (
                      <p className="mt-1 text-xs text-red-400">
                        {form.formState.errors.defaultExercises?.[index]?.restSeconds?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-400">Notes</label>
                  <textarea
                    rows={2}
                    {...form.register(`defaultExercises.${index}.notes` as const)}
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>
            ))}

            {form.formState.errors.defaultExercises?.root && (
              <p className="text-sm text-red-400">{form.formState.errors.defaultExercises?.root?.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              {summary && summary.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-300">Summary</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {summary.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Saving…' : selectedWorkoutId ? 'Update Workout' : 'Create Workout'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
