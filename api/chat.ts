import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// ── Crisis Detection ────────────────────────────────
const CRISIS_PATTERNS = [
  /(?:want|going|plan|think)\s*(?:to)?\s*(?:die|kill\s*(?:my)?self|end\s*(?:it|my\s*life))/i,
  /(?:ไม่อยาก(?:อยู่|มีชีวิต)|อยากตาย|ฆ่าตัวตาย|คิดสั้น)/i,
  /(?:hurt|cut|burn|harm)\s*(?:my)?self/i,
  /(?:ทำร้าย|ตัด|กรีด)\s*(?:ตัว)?เอง/i,
  /(?:hopeless|สิ้นหวัง|หมดหวัง|ไม่มีทางออก)/i,
  /(?:can'?t\s*(?:take|handle|cope)\s*(?:it|anymore)|ทน(ไม่)?ไหว)/i,
];

function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some(p => p.test(text));
}

const CRISIS_ADDITION = `

SAFETY ALERT: The user's message may indicate emotional crisis.
You MUST: 1) Acknowledge their pain with deep empathy 2) Validate their feelings
3) Gently encourage contacting a crisis helpline 4) End with hope and resources:
Thailand: สายด่วนสุขภาพจิต 1323, Samaritans 02-713-6793 | US: 988 Lifeline.`;

// ── System Prompt ───────────────────────────────────
const SYSTEM_PROMPT = `You are EchoMind, a compassionate AI conversation partner for emotional reflection.

Your role:
- Listen deeply and ask thoughtful follow-up questions
- Help the user explore their feelings more deeply
- Validate emotions without judgment
- Gently reframe situations when appropriate
- Suggest tiny actionable steps when natural
- Remember what was said earlier in the conversation

Style:
- Warm, calm, conversational tone
- Keep responses under 100 words
- Ask ONE follow-up question per response (not multiple)
- Use the user's language (English, Thai, or mixed)
- Never diagnose or give medical advice
- Sometimes just validate — not every message needs a question

When the conversation seems to reach a natural conclusion:
- Summarize the key insight from the conversation
- Offer one gentle takeaway or action item
- Let the user know they can come back anytime`;

// ── Handler ─────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const selectedModel = model || 'gpt-4o-mini';

    // Check if latest user message contains crisis indicators
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const isCrisis = lastUserMsg ? detectCrisis(lastUserMsg.content) : false;

    const systemPrompt = SYSTEM_PROMPT + (isCrisis ? CRISIS_ADDITION : '');

    const response = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_completion_tokens: 300,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;

    res.status(200).json({
      reply,
      model: selectedModel,
      crisis: isCrisis,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
