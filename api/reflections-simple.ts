import { VercelRequest, VercelResponse } from '@vercel/node';

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

  try {
    if (req.method === 'POST') {
      // Try to use the real database, fallback to mock if it fails
      try {
        const { storage } = await import("./storage");
        const { analyzeReflection } = await import("./llm");
        const { insertReflectionSchema } = await import("../shared/schema");
        
        // Initialize storage
        if (storage.initialize) {
          await storage.initialize();
        }
        
        const body = insertReflectionSchema.parse(req.body);
        
        // Get recent emotions for context
        let recentEmotions = [];
        try {
          const recentReflections = await storage.getReflections("default-user");
          recentEmotions = recentReflections.slice(0, 3).map(r => r.emotion);
        } catch (error) {
          console.log("Could not fetch recent reflections:", error);
        }

        // Analyze with AI
        let analysis;
        try {
          analysis = await analyzeReflection(body.inputText, recentEmotions);
        } catch (error) {
          console.log("AI analysis failed, using fallback:", error);
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

        // Create reflection in database
        const reflection = await storage.createReflection("default-user", {
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
      } catch (dbError) {
        console.log("Database error, using mock response:", dbError);
        
        // Fallback to mock response
        const mockReflection = {
          id: "mock-" + Date.now(),
          userId: "default-user",
          inputText: req.body?.inputText || "Test input",
          emotion: "Mixed",
          summary: "I'm processing what you shared. Your feelings are valid and important.",
          reframe: "Taking time to reflect is a meaningful step toward understanding yourself better.",
          actions: [
            "Take a few deep breaths",
            "Note one thing you're grateful for",
            "Take a short walk or stretch"
          ],
          voice: req.body?.voice || false,
          sentiment: null,
          energy: null,
          createdAt: new Date().toISOString()
        };

        res.status(200).json(mockReflection);
      }
    } else if (req.method === 'GET') {
      // Try to get real reflections, fallback to empty array
      try {
        const { storage } = await import("./storage");
        
        if (storage.initialize) {
          await storage.initialize();
        }
        
        const reflections = await storage.getReflections("default-user");
        res.status(200).json(reflections);
      } catch (dbError) {
        console.log("Database error, returning empty array:", dbError);
        res.status(200).json([]);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error in reflections API:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
