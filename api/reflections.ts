import express from 'express';
import { storage } from "./storage";
import { analyzeReflection } from "./llm";
import { insertReflectionSchema } from "../shared/schema";
import type { Emotion } from "../shared/schema";
import { z } from "zod";

const app = express();
app.use(express.json());

// Initialize storage once
let initialized = false;
async function ensureInitialized() {
  if (!initialized && storage.initialize) {
    await storage.initialize();
    initialized = true;
  }
}

const DEFAULT_USER_ID = "default-user";

// CORS middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  next();
});

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

export default app;
