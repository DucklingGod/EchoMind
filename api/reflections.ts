import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "./storage";
import { analyzeReflection } from "./llm";
import { insertReflectionSchema } from "../shared/schema";
import type { Emotion } from "../shared/schema";
import { z } from "zod";

// Initialize storage once
let initialized = false;
async function ensureInitialized() {
  if (!initialized && storage.initialize) {
    await storage.initialize();
    initialized = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const DEFAULT_USER_ID = "default-user";

  try {
    await ensureInitialized();
    
    if (req.method === 'POST') {
      // Create reflection
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

      res.status(200).json(reflection);
    } else if (req.method === 'GET') {
      // Get reflections
      const reflections = await storage.getReflections(DEFAULT_USER_ID);
      res.status(200).json(reflections);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error in reflections API:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
