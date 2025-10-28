import express, { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { analyzeReflection } from "./llm";
import { insertReflectionSchema } from "../shared/schema";
import type { Emotion } from "../shared/schema";
import { z } from "zod";
import multer from "multer";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import OpenAI from "openai";

const app = express();
const DEFAULT_USER_ID = "default-user";
const upload = multer({ storage: multer.memoryStorage() });

// JSON parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for production
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  next();
});

// Initialize storage once
let initialized = false;
async function ensureInitialized() {
  if (!initialized && storage.initialize) {
    await storage.initialize();
    initialized = true;
  }
}

// API Routes
app.post("/api/reflections", async (req, res) => {
  try {
    await ensureInitialized();
    
    const body = insertReflectionSchema.parse(req.body);
    
    let recentEmotions: Emotion[] = [];
    try {
      const recentReflections = await storage.getReflections(DEFAULT_USER_ID);
      recentEmotions = recentReflections
        .slice(0, 3)
        .map(r => r.emotion as Emotion);
    } catch (storageError) {
      console.error("Failed to fetch recent reflections:", storageError);
    }

    let analysis;
    try {
      analysis = await analyzeReflection(body.inputText, recentEmotions);
    } catch (error) {
      console.error("AI analysis failed, using fallback:", error);
      analysis = {
        emotion: "Mixed" as const,
        summary: "I'm processing what you shared. Your feelings are valid and important.",
        reframe: "Taking time to reflect is a meaningful step toward understanding yourself better.",
        actions: [
          "Take a few deep breaths",
          "Note one thing you're grateful for",
          "Take a short walk or stretch"
        ],
      };
    }

    const reflection = await storage.createReflection(DEFAULT_USER_ID, {
      inputText: body.inputText,
      emotion: analysis.emotion,
      summary: analysis.summary,
      reframe: analysis.reframe,
      actions: analysis.actions,
      voice: body.voice,
      sentiment: null,
      energy: null,
    });

    res.json(reflection);
  } catch (error) {
    console.error("Error creating reflection:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to create reflection",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/analyze/voice", upload.single("audio"), async (req, res) => {
  let tempFilePath: string | null = null;
  
  try {
    if (!req.file) {
      res.status(400).json({ error: "No audio file provided" });
      return;
    }

    tempFilePath = join("/tmp", `audio-${randomUUID()}.webm`);
    await writeFile(tempFilePath, req.file.buffer);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file: await import("fs").then(fs => fs.createReadStream(tempFilePath!)),
      model: "whisper-1",
    });

    if (tempFilePath) {
      await unlink(tempFilePath);
      tempFilePath = null;
    }

    res.json({
      text: transcription.text,
      duration: 0,
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (unlinkError) {
        console.error("Error cleaning up temp file:", unlinkError);
      }
    }

    res.status(500).json({
      error: "Failed to transcribe audio",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/reflections", async (req, res) => {
  try {
    await ensureInitialized();
    
    const reflections = await storage.getReflections(DEFAULT_USER_ID);
    res.json(reflections);
  } catch (error) {
    console.error("Error fetching reflections:", error);
    res.status(500).json({
      error: "Failed to fetch reflections",
    });
  }
});

app.delete("/api/reflections/all", async (req, res) => {
  try {
    await ensureInitialized();
    
    await storage.deleteAllReflections(DEFAULT_USER_ID);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error deleting all reflections:", error);
    res.status(500).json({
      error: "Failed to delete all reflections",
    });
  }
});

app.delete("/api/reflections/:id", async (req, res) => {
  try {
    await ensureInitialized();
    
    const { id } = req.params;
    const success = await storage.deleteReflection(DEFAULT_USER_ID, id);
    
    if (!success) {
      res.status(404).json({ error: "Reflection not found" });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error deleting reflection:", error);
    res.status(500).json({
      error: "Failed to delete reflection",
    });
  }
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Export for Vercel serverless
export default app;
