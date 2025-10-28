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
      // Simple reflection response without database
      const mockReflection = {
        id: "test-" + Date.now(),
        userId: "default-user",
        inputText: req.body?.inputText || "Test input",
        emotion: "Mixed",
        summary: "This is a test reflection. Your feelings are valid.",
        reframe: "Taking time to reflect is meaningful.",
        actions: [
          "Take a deep breath",
          "Write down one thing you're grateful for"
        ],
        voice: false,
        sentiment: null,
        energy: null,
        createdAt: new Date().toISOString()
      };

      res.status(200).json(mockReflection);
    } else if (req.method === 'GET') {
      // Return empty array for now
      res.status(200).json([]);
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
