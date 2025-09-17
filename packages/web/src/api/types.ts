export interface WorkoutExercise {
  name: string;
  notes?: string | null;
  targetReps: number;
  targetWeight?: number | null;
  restSeconds: number;
}

export interface Workout {
  id: string;
  name: string;
  description?: string | null;
  defaultExercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseSet {
  id: string;
  exerciseName: string;
  reps: number;
  weight?: number | null;
  rpe?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  notes?: string | null;
  workoutId: string;
  workout?: Workout;
  exerciseSets: ExerciseSet[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSummary extends Workout {
  sessions?: WorkoutSession[];
}
