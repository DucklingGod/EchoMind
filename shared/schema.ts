import { z } from "zod";
import { pgTable, text, timestamp, jsonb, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const emotionEnum = z.enum([
  "Joy",
  "Calm",
  "Anxious",
  "Sad",
  "Angry",
  "Confused",
  "Mixed"
]);

export type Emotion = z.infer<typeof emotionEnum>;

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  plan: text("plan").notNull().default("free"),
  settings: jsonb("settings").$type<{
    clientEncryption?: boolean;
    passphrase?: string;
  }>(),
});

export const reflections = pgTable("reflections", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  inputText: text("input_text").notNull(),
  emotion: text("emotion").notNull(),
  summary: text("summary").notNull(),
  reframe: text("reframe").notNull(),
  actions: text("actions").array().notNull(),
  voice: boolean("voice").notNull().default(false),
  sentiment: real("sentiment"),
  energy: real("energy"),
});

export type User = typeof users.$inferSelect;
export type Reflection = typeof reflections.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type InsertReflection = typeof reflections.$inferInsert;

export const insertUserSchema = z.object({
  plan: z.string().default("free"),
  settings: z.object({
    clientEncryption: z.boolean().optional(),
    passphrase: z.string().optional(),
  }).optional(),
});

export const insertReflectionSchema = z.object({
  inputText: z.string().min(1, "Please share what's on your mind"),
  voice: z.boolean().default(false),
  clientEnc: z.boolean().optional(),
});

export const reflectionResponseSchema = z.object({
  emotion: emotionEnum,
  summary: z.string(),
  reframe: z.string(),
  actions: z.array(z.string()),
});

export type ReflectionResponse = z.infer<typeof reflectionResponseSchema>;
