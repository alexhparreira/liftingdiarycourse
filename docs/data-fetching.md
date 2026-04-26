# Data Fetching

## Rule: Server Components Only

**ALL data fetching must be done exclusively via React Server Components.**

Do NOT fetch data via:
- Route handlers (`app/api/`)
- Client components (`"use client"`)
- `useEffect` + `fetch`
- SWR, React Query, or any client-side fetching library
- Any other mechanism

If you need data in a client component, fetch it in a parent server component and pass it down as props.

## Rule: Drizzle ORM via `/data` Helpers Only

**ALL database queries must be performed through helper functions located in the `/data` directory.**

- Helper functions use Drizzle ORM exclusively — **never write raw SQL**
- No database access is permitted outside of `/data` helpers
- Server components call `/data` helpers; they do not query the database directly

### Example structure

```
src/
  data/
    workouts.ts     # getWorkoutsByUserId, getWorkoutById, ...
    exercises.ts    # getExercisesByUserId, ...
```

### Example helper

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsByUserId(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```ts
// src/app/dashboard/page.tsx  (Server Component)
import { getWorkoutsByUserId } from "@/data/workouts";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsByUserId(session.user.id);
  // ...
}
```

## Rule: Users Can Only Access Their Own Data

**Every `/data` helper that returns user-specific data MUST filter by the authenticated user's ID.**

- Always resolve the current user inside the helper or accept `userId` as a parameter and filter on it
- Never expose a helper that returns all rows without a user filter
- Never trust a `userId` coming from the client — always derive it from the server-side session

### Correct pattern

```ts
export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}
```

Passing only `workoutId` without the `userId` filter would allow any authenticated user to read another user's record — **this is a critical security violation and must never happen.**

## Summary

| Concern | Required approach |
|---|---|
| Where to fetch data | Server Components only |
| How to query the database | Drizzle ORM, via `/data` helpers |
| Raw SQL | Never |
| Data scope | Always filtered to the authenticated user |
