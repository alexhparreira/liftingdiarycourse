# Data Mutations

## Rule: Mutations via `/data` Helpers Only

**ALL database mutations must be performed through helper functions located in the `src/data` directory.**

- Helper functions use Drizzle ORM exclusively — **never write raw SQL**
- No database access is permitted outside of `/data` helpers
- Server actions call `/data` helpers; they do not query or mutate the database directly

### Example structure

```
src/
  data/
    workouts.ts     # createWorkout, updateWorkout, deleteWorkout, ...
    exercises.ts    # createExercise, deleteExercise, ...
```

### Example helper

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(userId: string, name: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name })
    .returning();
  return workout;
}

export async function deleteWorkout(workoutId: string, userId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Rule: Server Actions in Colocated `actions.ts` Files

**ALL data mutations must be triggered via Server Actions defined in a file named `actions.ts` colocated with the route that uses them.**

Do NOT mutate data via:
- Route handlers (`app/api/`)
- Client-side `fetch` / `axios` calls
- Direct calls to `/data` helpers from client components
- Any other mechanism

### Example structure

```
src/
  app/
    dashboard/
      workouts/
        page.tsx
        actions.ts    # Server Actions for this route
```

### Example server action

```ts
// src/app/dashboard/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function createWorkoutAction(params: { name: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { name } = createWorkoutSchema.parse(params);

  return createWorkout(session.user.id, name);
}
```

## Rule: Typed Params — No `FormData`

**ALL server action parameters must be explicitly typed. `FormData` is not permitted as a parameter type.**

Pass plain typed objects instead:

```ts
// WRONG
export async function createWorkoutAction(formData: FormData) { ... }

// CORRECT
export async function createWorkoutAction(params: { name: string }) { ... }
```

## Rule: Zod Validation on Every Server Action

**ALL server actions MUST validate their arguments with Zod before performing any work.**

- Define a Zod schema for each action's input
- Call `.parse()` (or `.safeParse()` if you need to return a structured error) as the first step after auth
- Never trust caller-supplied values without parsing them first

### Validation pattern

```ts
const schema = z.object({
  name: z.string().min(1).max(100),
  notes: z.string().optional(),
});

export async function createWorkoutAction(params: { name: string; notes?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = schema.parse(params);

  return createWorkout(session.user.id, validated.name, validated.notes);
}
```

## Rule: Users Can Only Mutate Their Own Data

**Every `/data` mutation helper MUST scope the operation to the authenticated user's ID.**

- Always derive `userId` from the server-side session inside the server action — never accept it as a caller-supplied parameter
- Pass `userId` into the `/data` helper and include it in every `WHERE` clause for updates and deletes

```ts
// WRONG — caller controls which user's data is mutated
export async function deleteWorkoutAction(params: { workoutId: string; userId: string }) { ... }

// CORRECT — userId comes from the session
export async function deleteWorkoutAction(params: { workoutId: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { workoutId } = schema.parse(params);
  await deleteWorkout(workoutId, session.user.id);
}
```

## Rule: No `redirect()` Inside Server Actions

**Server actions must NOT call `redirect()`.** Navigation is a client concern — after a server action resolves, the calling client component is responsible for redirecting with `router.push()`.

```ts
// WRONG — redirect inside the server action
export async function createWorkoutAction(params: { name: string }) {
  // ...
  await createWorkout(userId, name);
  redirect("/dashboard"); // ❌
}

// CORRECT — server action returns, client navigates
export async function createWorkoutAction(params: { name: string }) {
  // ...
  return createWorkout(userId, name);
}
```

```tsx
// Client component handles the redirect
startTransition(async () => {
  await createWorkoutAction({ name });
  router.push("/dashboard"); // ✅
});
```

## Summary

| Concern | Required approach |
|---|---|
| Where to write DB mutations | `src/data` helpers via Drizzle ORM |
| Raw SQL | Never |
| Where to call mutations from | Server Actions only |
| Where to define server actions | Colocated `actions.ts` file |
| Server action param types | Explicit TypeScript types — no `FormData` |
| Input validation | Zod on every server action |
| Auth scope | Always filtered to the authenticated user; `userId` from session only |
| Post-action navigation | `router.push()` in the client component — never `redirect()` in the action |
