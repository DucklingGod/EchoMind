/**
 * Crisis Detection System for EchoMind
 * 
 * Detects keywords/phrases that may indicate a user is in crisis.
 * This is a SAFETY feature — false positives are acceptable,
 * false negatives are NOT.
 */

interface CrisisMatch {
  level: "high" | "medium";
  category: string;
  matchedPattern: string;
}

// High severity — immediate danger indicators
const HIGH_SEVERITY_PATTERNS: { pattern: RegExp; category: string }[] = [
  // Suicidal ideation
  { pattern: /(?:want|going|plan|think)\s*(?:to)?\s*(?:die|kill\s*(?:my)?self|end\s*(?:it|my\s*life|everything))/i, category: "suicidal_ideation" },
  { pattern: /(?:suicid|ซึมเศร้า).*(?:thought|idea|plan|attempt)/i, category: "suicidal_ideation" },
  { pattern: /(?:ไม่อยาก(?:อยู่|มีชีวิต)|อยากตาย|ฆ่าตัวตาย|คิดสั้น|จบชีวิต)/i, category: "suicidal_ideation" },
  { pattern: /(?:better\s*off\s*(?:dead|without\s*me|gone)|no\s*(?:reason|point)\s*(?:to)?\s*(?:live|go\s*on|continue))/i, category: "suicidal_ideation" },
  { pattern: /(?:goodbye|บอกลา).*(?:forever|ทุกคน|everyone|for\s*good)/i, category: "suicidal_ideation" },
  { pattern: /(?:writing|drafting|wrote)\s*(?:a)?\s*(?:suicide| farewell)\s*(?:note|letter)/i, category: "suicidal_ideation" },
  
  // Self-harm
  { pattern: /(?:hurt|cut|burn|har|harm)\s*(?:my)?self/i, category: "self_harm" },
  { pattern: /(?:ทำร้าย|ตัด|กรีด|เผา)\s*(?:ตัว)?เอง/i, category: "self_harm" },
  { pattern: /(?:self[\s-]?harm|overdose|กินยาเกินขนาด)/i, category: "self_harm" },
  
  // Immediate danger
  { pattern: /(?:have|took|swallowed|กิน)\s*(?:a)?\s*(?:pills|ยา).*(?:overdose|太多了|too\s*many)/i, category: "immediate_danger" },
  { pattern: /(?:bleeding|เลือดออก).*(?:bad|much|เยอะ|แย่)/i, category: "immediate_danger" },
];

// Medium severity — warning signs
const MEDIUM_SEVERITY_PATTERNS: { pattern: RegExp; category: string }[] = [
  // Hopelessness
  { pattern: /(?:hopeless|no\s*hope|สิ้นหวัง|หมดหวัง|ไม่มีทางออก)/i, category: "hopelessness" },
  { pattern: /(?:nothing\s*(?:will|ever)\s*(?:get|change|improve)|things\s*will\s*never\s*(?:get\s*)?better)/i, category: "hopelessness" },
  { pattern: /(?:burden|เป็นภาระ).*(?:to|for|everyone|ทุกคน|people\s*(?:around|close))/i, category: "hopelessness" },
  { pattern: /(?:trapped|stuck|ติดกับ|ไม่มีทางออก|no\s*way\s*out)/i, category: "hopelessness" },
  
  // Emotional crisis
  { pattern: /(?:can'?t\s*(?:take|handle|cope|stand)\s*(?:it|this|anymore)|ทน(ไม่)?ไหว(?:แล้ว)?)/i, category: "emotional_crisis" },
  { pattern: /(?:falling\s*apart|breaking\s*down|แตกสลาย|พังทลาย)/i, category: "emotional_crisis" },
  { pattern: /(?:don'?t\s*want\s*to\s*(?:be\s*here|exist|wake\s*up)|ไม่อยาก(?:อยู่ตรงนี้|ตื่นมา))/i, category: "emotional_crisis" },
  { pattern: /(?:nobody\s*(?:cares|would\s*miss|loves)\s*me|ไม่มีใคร(?:รัก|สน|แคร์))/i, category: "emotional_crisis" },
  { pattern: /(?:what'?s\s*the\s*point|มันมีอะไรดี|มีประโยชน์อะไร)/i, category: "emotional_crisis" },
];

/**
 * Analyze text for crisis indicators
 * Returns null if no crisis detected, or a CrisisMatch if detected
 */
export function detectCrisis(text: string): CrisisMatch | null {
  const normalizedText = text.trim().toLowerCase();
  
  // Skip very short inputs (likely not real crisis expressions)
  if (normalizedText.length < 5) return null;
  
  // Check high severity first
  for (const { pattern, category } of HIGH_SEVERITY_PATTERNS) {
    if (pattern.test(text)) {
      return { level: "high", category, matchedPattern: pattern.source };
    }
  }
  
  // Check medium severity
  for (const { pattern, category } of MEDIUM_SEVERITY_PATTERNS) {
    if (pattern.test(text)) {
      return { level: "medium", category, matchedPattern: pattern.source };
    }
  }
  
  return null;
}

/**
 * Crisis resources by region/language
 */
export const CRISIS_RESOURCES = {
  th: {
    name: "Thailand",
    hotlines: [
      { name: "สายด่วนสุขภาพจิต", number: "1323", description: "กรมสุขภาพจิต กระทรวงสาธารณสุข" },
      { name: "สายด่วนกู้ชีพ", number: "1669", description: "สถาบันการแพทย์ฉุกเฉินแห่งชาติ" },
      { name: "Samaritans Thailand", number: "02-713-6793", description: "สายด่วนป้องกันการฆ่าตัวตาย (24 ชม.)" },
    ],
  },
  us: {
    name: "United States",
    hotlines: [
      { name: "988 Suicide & Crisis Lifeline", number: "988", description: "Call or text 988 — 24/7 free support" },
      { name: "Crisis Text Line", number: "Text HOME to 741741", description: "Free 24/7 text-based crisis support" },
      { name: "SAMHSA Helpline", number: "1-800-662-4357", description: "Free 24/7 treatment referral service" },
    ],
  },
  intl: {
    name: "International",
    hotlines: [
      { name: "International Association for Suicide Prevention", number: "https://www.iasp.info/resources/Crisis_Centres/", description: "Crisis centers worldwide" },
      { name: "Befrienders Worldwide", number: "https://www.befrienders.org/", description: "Emotional support in 32 countries" },
    ],
  },
};

/**
 * Generate a crisis-aware system prompt for the AI
 */
export function getCrisisSystemPrompt(originalPrompt: string, crisisCategory: string): string {
  return `${originalPrompt}

CRITICAL SAFETY ALERT: The user's message contains indicators of ${crisisCategory.replace(/_/g, " ")}.

Your response MUST:
1. Acknowledge their pain with deep empathy — do NOT minimize or dismiss
2. Validate that their feelings are real and that reaching out takes courage
3. Gently encourage them to contact a crisis helpline or trusted person
4. Do NOT provide medical advice or try to diagnose
5. Keep the tone warm, calm, and non-judgmental
6. End with hope — remind them that help is available and they don't have to face this alone

Available crisis resources to mention:
- Thailand: สายด่วนสุขภาพจิต 1323, Samaritans 02-713-6793
- US: 988 Suicide & Crisis Lifeline (call/text 988)
- International: befrienders.org`;
}
