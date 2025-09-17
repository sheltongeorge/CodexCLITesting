import { api } from './client';
import type { Workout, WorkoutSummary, WorkoutExercise } from './types';

export interface UpsertWorkoutPayload {
  id?: string;
  name: string;
  description?: string | null;
  defaultExercises: WorkoutExercise[];
}

export async function fetchWorkouts(): Promise<Workout[]> {
  const { data } = await api.get<Workout[]>('/api/workouts');
  return data.map((workout) => ({
    ...workout,
    defaultExercises: (workout.defaultExercises as WorkoutExercise[]) ?? []
  }));
}

export async function fetchWorkout(id: string): Promise<WorkoutSummary> {
  const { data } = await api.get<WorkoutSummary>(`/api/workouts/${id}`);
  return {
    ...data,
    defaultExercises: (data.defaultExercises as WorkoutExercise[]) ?? []
  };
}

export async function upsertWorkout(payload: UpsertWorkoutPayload): Promise<Workout> {
  const { data } = await api.post<Workout>('/api/workouts', payload);
  return {
    ...data,
    defaultExercises: (data.defaultExercises as WorkoutExercise[]) ?? []
  };
}
