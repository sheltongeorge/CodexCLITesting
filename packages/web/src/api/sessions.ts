import { api } from './client';
import type { ExerciseSet, WorkoutSession } from './types';

export interface ExerciseSetInput {
  exerciseName: string;
  reps: number;
  weight?: number | null;
  rpe?: number | null;
  notes?: string | null;
}

export interface CreateSessionPayload {
  workoutId: string;
  date: Date;
  notes?: string | null;
  exerciseSets: ExerciseSetInput[];
}

export interface SessionsQuery {
  from?: Date;
  to?: Date;
}

export async function fetchSessions(query?: SessionsQuery): Promise<WorkoutSession[]> {
  const params = new URLSearchParams();

  if (query?.from) {
    params.set('from', query.from.toISOString());
  }

  if (query?.to) {
    params.set('to', query.to.toISOString());
  }

  const url = params.toString() ? `/api/sessions?${params.toString()}` : '/api/sessions';
  const { data } = await api.get<WorkoutSession[]>(url);
  return data;
}

export async function fetchSession(id: string): Promise<WorkoutSession> {
  const { data } = await api.get<WorkoutSession>(`/api/sessions/${id}`);
  return data;
}

export async function createSession(payload: CreateSessionPayload): Promise<WorkoutSession> {
  const { data } = await api.post<WorkoutSession>('/api/sessions', {
    ...payload,
    date: payload.date.toISOString()
  });
  return data;
}
