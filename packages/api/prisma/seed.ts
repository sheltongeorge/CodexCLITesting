import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fullBodyExercises: Prisma.JsonArray = [
  {
    name: 'Back Squat',
    notes: 'Keep chest up, drive through heels.',
    targetReps: 5,
    targetWeight: 225,
    restSeconds: 180
  },
  {
    name: 'Bench Press',
    notes: 'Squeeze shoulder blades together.',
    targetReps: 5,
    targetWeight: 185,
    restSeconds: 150
  },
  {
    name: 'Deadlift',
    notes: 'Neutral spine, hinge at hips.',
    targetReps: 5,
    targetWeight: 275,
    restSeconds: 210
  }
];

const hypertrophyExercises: Prisma.JsonArray = [
  {
    name: 'Incline Dumbbell Press',
    notes: 'Slow eccentric, full ROM.',
    targetReps: 12,
    targetWeight: 55,
    restSeconds: 90
  },
  {
    name: 'Lat Pulldown',
    notes: 'Pause at chest.',
    targetReps: 12,
    targetWeight: 140,
    restSeconds: 75
  },
  {
    name: 'Cable Lateral Raise',
    notes: 'Control the negative.',
    targetReps: 15,
    targetWeight: 20,
    restSeconds: 60
  }
];

async function main() {
  await prisma.exerciseSet.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.workout.deleteMany();

  const fullBody = await prisma.workout.create({
    data: {
      name: 'Full Body Strength',
      description: 'Compound lifts targeting the whole body.',
      defaultExercises: fullBodyExercises
    }
  });

  const hypertrophy = await prisma.workout.create({
    data: {
      name: 'Upper Body Pump',
      description: 'Higher-volume push/pull work.',
      defaultExercises: hypertrophyExercises
    }
  });

  await prisma.workoutSession.create({
    data: {
      workoutId: fullBody.id,
      date: new Date('2024-05-01T12:00:00Z'),
      notes: 'Strong session, focus on breathing between sets.',
      exerciseSets: {
        create: [
          {
            exerciseName: 'Back Squat',
            reps: 5,
            weight: 225,
            rpe: 8,
            notes: 'Last rep grindy.'
          },
          {
            exerciseName: 'Bench Press',
            reps: 5,
            weight: 185,
            rpe: 7.5
          },
          {
            exerciseName: 'Deadlift',
            reps: 5,
            weight: 275,
            rpe: 8.5,
            notes: 'Hook grip held up well.'
          }
        ]
      }
    }
  });

  await prisma.workoutSession.create({
    data: {
      workoutId: hypertrophy.id,
      date: new Date('2024-05-03T12:00:00Z'),
      notes: 'Higher reps felt smooth; try heavier pulldowns next time.',
      exerciseSets: {
        create: [
          {
            exerciseName: 'Incline Dumbbell Press',
            reps: 12,
            weight: 55,
            rpe: 7
          },
          {
            exerciseName: 'Lat Pulldown',
            reps: 12,
            weight: 140,
            rpe: 6.5
          },
          {
            exerciseName: 'Cable Lateral Raise',
            reps: 15,
            weight: 20,
            rpe: 8,
            notes: 'Burning by the end.'
          }
        ]
      }
    }
  });
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
