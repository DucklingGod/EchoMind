import OpenAI from "openai";
import type { ReflectionResponse, Emotion } from "@shared/schema";

// Using GPT-4o for high-quality emotional reflection analysis
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are EchoMind, a concise, compassionate reflection assistant.

Goals:
1. Identify the primary emotion from the user's input
2. Reflect and validate their feelings with empathy
3. Reframe the situation into something that gives them agency and perspective
4. Suggest 1-3 tiny, actionable steps they can take

Constraints:
- Keep your entire response under 140 words total
- Use plain, conversational language
- Never diagnose mental health conditions
- Be calm, respectful, and non-judgmental
- Focus on practical wisdom and gentle encouragement

Available emotions: Joy, Calm, Anxious, Sad, Angry, Confused, Mixed

Output format: JSON with this structure:
{
  "emotion": "one of the available emotions",
  "summary": "reflect and validate their core feeling",
  "reframe": "offer a compassionate reframe that empowers them",
  "actions": ["action 1", "action 2", "action 3"]
}`;

export async function analyzeReflection(
  inputText: string,
  recentEmotions: Emotion[] = []
): Promise<ReflectionResponse> {
  try {
    const contextInfo = recentEmotions.length > 0
      ? `\nRecent emotional context: ${recentEmotions.join(", ")}`
      : "";

    const userPrompt = `User's reflection: """${inputText}"""${contextInfo}\n\nProvide your response as JSON only.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI");
    }

    const parsed = JSON.parse(content);
    
    return {
      emotion: parsed.emotion as Emotion,
      summary: parsed.summary,
      reframe: parsed.reframe,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    };
  } catch (error) {
    console.error("Error analyzing reflection:", error);
    
    return getFallbackResponse(inputText);
  }
}

function getFallbackResponse(inputText: string): ReflectionResponse {
  const lowerText = inputText.toLowerCase();
  
  let emotion: Emotion = "Mixed";
  if (lowerText.match(/happy|joy|excited|great|wonderful|amazing/)) {
    emotion = "Joy";
  } else if (lowerText.match(/calm|peace|relax|tranquil|serene/)) {
    emotion = "Calm";
  } else if (lowerText.match(/anxious|worry|stress|nervous|overwhelm/)) {
    emotion = "Anxious";
  } else if (lowerText.match(/sad|depressed|down|lonely|hurt/)) {
    emotion = "Sad";
  } else if (lowerText.match(/angry|mad|furious|frustrated|annoyed/)) {
    emotion = "Angry";
  } else if (lowerText.match(/confused|uncertain|lost|unclear/)) {
    emotion = "Confused";
  }

  return {
    emotion,
    summary: "I hear what you're sharing. Your feelings are valid.",
    reframe: "Sometimes just naming what we feel is the first step toward clarity. You're already doing that.",
    actions: [
      "Take three deep breaths",
      "Write one thing you're grateful for",
      "Step outside for 5 minutes"
    ],
  };
}
