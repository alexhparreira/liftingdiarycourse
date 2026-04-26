"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required").max(255),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: { name: string; startedAt: Date }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { name, startedAt } = createWorkoutSchema.parse(params);

  return createWorkout(userId, name, startedAt);
}
