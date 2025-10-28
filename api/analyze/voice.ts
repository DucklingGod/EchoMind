import express from 'express';
import multer from 'multer';
import OpenAI from "openai";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// CORS middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  next();
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

export default app;
