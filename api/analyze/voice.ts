import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from "openai";
import { randomUUID } from "crypto";

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

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // For Vercel, we need to handle the file differently
    // The file will be in req.body as base64 or buffer
    const audioData = req.body;
    
    if (!audioData) {
      res.status(400).json({ error: "No audio file provided" });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Convert the audio data to a format OpenAI can use
    const audioBuffer = Buffer.from(audioData, 'base64');
    const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    res.status(200).json({
      text: transcription.text,
      duration: 0,
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    
    res.status(500).json({
      error: "Failed to transcribe audio",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
