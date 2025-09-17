-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."Workout" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultExercises" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkoutSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "workoutId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExerciseSet" (
    "id" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "rpe" DOUBLE PRECISION,
    "notes" TEXT,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workout_name_key" ON "public"."Workout"("name");

-- CreateIndex
CREATE INDEX "WorkoutSession_workoutId_idx" ON "public"."WorkoutSession"("workoutId");

-- CreateIndex
CREATE INDEX "WorkoutSession_date_idx" ON "public"."WorkoutSession"("date");

-- CreateIndex
CREATE INDEX "ExerciseSet_sessionId_idx" ON "public"."ExerciseSet"("sessionId");

-- CreateIndex
CREATE INDEX "ExerciseSet_exerciseName_idx" ON "public"."ExerciseSet"("exerciseName");

-- AddForeignKey
ALTER TABLE "public"."WorkoutSession"
ADD CONSTRAINT "WorkoutSession_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExerciseSet"
ADD CONSTRAINT "ExerciseSet_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
