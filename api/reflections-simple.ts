import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc } from 'drizzle-orm';
import { pgTable, text, timestamp, jsonb, boolean, real } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

// ── Schema ──────────────────────────────────────────
const emotionEnum = z.enum(["Joy", "Calm", "Anxious", "Sad", "Angry", "Confused", "Mixed"]);
type Emotion = z.infer<typeof emotionEnum>;

const users = pgTable("users", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  plan: text("plan").notNull().default("free"),
  settings: jsonb("settings"),
});

const reflections = pgTable("reflections", {
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

const insertReflectionSchema = z.object({
  inputText: z.string().min(1, "Please share what's on your mind"),
  voice: z.boolean().default(false),
});

// ── DB ──────────────────────────────────────────────
let db: ReturnType<typeof drizzle> | null = null;
function getDb() {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = neon(url);
  db = drizzle(sql);
  return db;
}

// ── LLM ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are EchoMind, a concise, compassionate reflection assistant.
Goals: 1) Identify the primary emotion 2) Reflect and validate feelings 3) Reframe with agency 4) Suggest 1-3 tiny actionable steps.
Constraints: Under 140 words, plain language, never diagnose, calm and non-judgmental.
Available emotions: Joy, Calm, Anxious, Sad, Angry, Confused, Mixed
Output JSON: {"emotion":"...","summary":"...","reframe":"...","actions":["..."]}`;

async function analyzeReflection(inputText: string, recentEmotions: string[] = []) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const context = recentEmotions.length > 0 ? `\nRecent emotions: ${recentEmotions.join(", ")}` : "";
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `User's reflection: """${inputText}"""${context}\n\nRespond as JSON only.` },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 500,
  });
  const content = response.choices[0].message.content;
  if (!content) throw new Error("Empty AI response");
  return JSON.parse(content);
}

// ── Handler ─────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const body = insertReflectionSchema.parse(req.body);

      // Get recent emotions
      let recentEmotions: string[] = [];
      let database;
      try {
        database = getDb();
        // Ensure default user exists
        await database.insert(users).values({ id: "default-user", plan: "free" }).onConflictDoNothing();
        const recent = await database.select().from(reflections).where(eq(reflections.userId, "default-user")).orderBy(desc(reflections.createdAt)).limit(3);
        recentEmotions = recent.map((r: any) => r.emotion);
      } catch (e) {
        console.log("DB init error:", e);
      }

      // AI analysis
      let analysis;
      try {
        analysis = await analyzeReflection(body.inputText, recentEmotions);
      } catch (e) {
        console.log("AI analysis failed:", e);
        analysis = {
          emotion: "Mixed",
          summary: "I'm processing what you shared. Your feelings are valid and important.",
          reframe: "Taking time to reflect is a meaningful step toward understanding yourself better.",
          actions: ["Take a few deep breaths", "Note one thing you're grateful for", "Take a short walk or stretch"],
        };
      }

      // Save to DB
      if (database) {
        try {
          const id = randomUUID();
          const result = await database.insert(reflections).values({
            id,
            userId: "default-user",
            inputText: body.inputText,
            emotion: analysis.emotion,
            summary: analysis.summary,
            reframe: analysis.reframe,
            actions: analysis.actions,
            voice: body.voice ?? false,
            sentiment: null,
            energy: null,
          }).returning();
          res.status(200).json(result[0]);
          return;
        } catch (e) {
          console.log("DB insert error:", e);
        }
      }

      // Fallback if DB insert failed
      res.status(200).json({
        id: "local-" + Date.now(),
        userId: "default-user",
        inputText: body.inputText,
        emotion: analysis.emotion,
        summary: analysis.summary,
        reframe: analysis.reframe,
        actions: analysis.actions,
        voice: body.voice ?? false,
        sentiment: null,
        energy: null,
        createdAt: new Date().toISOString(),
      });

    } else if (req.method === 'GET') {
      try {
        const database = getDb();
        const data = await database.select().from(reflections).where(eq(reflections.userId, "default-user")).orderBy(desc(reflections.createdAt));
        res.status(200).json(data);
      } catch (e) {
        console.log("DB read error:", e);
        res.status(200).json([]);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" });
  }
}
