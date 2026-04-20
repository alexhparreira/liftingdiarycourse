import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text().primaryKey(), // Clerk user ID
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const workouts = pgTable('workouts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text()
    .notNull()
    .references(() => users.id),
  name: varchar({ length: 255 }),
  startedAt: timestamp({ withTimezone: true }).defaultNow(),
  completedAt: timestamp({ withTimezone: true }),
});

export const exercises = pgTable('exercises', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const workoutExercises = pgTable('workout_exercises', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer()
    .notNull()
    .references(() => workouts.id),
  exerciseId: integer()
    .notNull()
    .references(() => exercises.id),
  order: integer().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const sets = pgTable('sets', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer()
    .notNull()
    .references(() => workoutExercises.id),
  setNumber: integer().notNull(),
  weight: numeric({ precision: 6, scale: 2 }),
  completed: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});
