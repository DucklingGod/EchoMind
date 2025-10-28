# EchoMind — AI Emotional Mirror
**Submit this file to Replit AI as your build spec.**  
Version: 1.0 (2025‑10‑29, Asia/Bangkok)

---

## 0) One‑liner & Vision
**EchoMind turns your emotional noise into clarity.** Speak or type; the AI reflects feelings, reframes thoughts, and tracks patterns to help you grow calmly, day by day.

**Core promise:** *Listen deeply → Reflect clearly → Grow consistently.*

---

## 1) Product Objectives
- **Reduce mental overload** via instant, private AI reflections.
- **Build daily habit** through lightweight journaling + insightful summaries.
- **Show progress** with simple visuals (mood trends, patterns, wins).
- **Protect privacy** with client‑side encryption options and transparent controls.

**Primary KPI (Phase 1):** D7 retention ≥ 25%, median daily reflections ≥ 1.  
**Secondary KPIs:** session NPS ≥ 8/10, 30‑day churn ≤ 45%.

---

## 2) Target Users & JTBD
- **Stressed workers & students** — “Help me sort my thoughts and sleep.”
- **Creators/Founders** — “Turn chaos into next steps.”
- **Neurodivergent users** — “Translate emotions into structured meaning.”

**Jobs-to-be-done**
- When I feel overwhelmed → *I want a safe space to unload* → so I can *feel calm and know one next step.*
- When I journal → *I want helpful summaries* → so I can *see patterns and improve tomorrow.*

---

## 3) Brand & UI Style
- **Theme:** Calm-tech + minimalist + glassmorphism.
- **Primary:** `#6C63FF` (Violet Blue, insight)
- **Secondary:** `#FFB6C1` (Soft Rose, empathy), `#1E1E2E` (Deep Indigo, focus)
- **Accent:** `#00D4FF` (Cyan, progress)
- **Typography:** Inter or Nunito. Rounded, human, readable.
- **Tone:** Private, reassuring, concise.

---

## 4) Scope (MVP → V1 → V2)
### MVP (2–4 weeks)
- Text & voice input (mic button).
- **AI Reflection:** emotion detection + summary + reframing.
- **Reflection Cards** saved in timeline.
- **Mood tags** (Joy/Calm/Anxious/Sad/Angry/Confused).
- **Daily recap** notification and dashboard.
- Local SQLite persistence (server) + optional **client‑side AES encryption** (passphrase).

### V1 (3–6 months)
- Voice emotion analysis (pace/energy).
- Mood trend graph; trigger insights.
- Mindmap of recurring themes (semantic clusters).
- “Insight Library” (things that help me / drain me).

### V2
- Forecast (likely mood based on patterns + calendar).
- Coach mode (7‑day micro‑missions).
- Wearable integrations (sleep/HR).

---

## 5) System Architecture (Replit‑friendly)
```
/ (root)
├─ server/ (Node.js + Express)
│  ├─ index.ts                # API bootstrap
│  ├─ routes/
│  │   ├─ reflections.ts      # create/list/delete reflections
│  │   ├─ analyze.ts          # AI endpoints (LLM, emotion)
│  ├─ services/
│  │   ├─ llm.ts              # GPT-5 wrapper (chat/reflection)
│  │   ├─ emotion.ts          # basic emotion classifier
│  │   ├─ speech.ts           # Whisper/ASR proxy (optional)
│  │   ├─ crypto.ts           # server encryption helpers
│  ├─ db/
│  │   ├─ prisma.schema       # Prisma + SQLite
│  │   └─ migrations/
│  ├─ middleware/
│  │   └─ auth.ts             # API key/session
│  ├─ utils/
│  │   └─ zod.ts              # input validation
│  └─ package.json
├─ web/ (React + Vite + Tailwind)
│  ├─ src/
│  │   ├─ App.tsx
│  │   ├─ pages/{Home,Timeline,Settings}.tsx
│  │   ├─ components/{Chat,MicButton,Card,MoodGraph}.tsx
│  │   ├─ lib/{api.ts, crypto.ts, store.ts}
│  │   └─ styles/index.css
│  ├─ index.html
│  └─ package.json
├─ .env.example
├─ replit.nix (or Replit config)
└─ README.md (this file)
```

**Stack**
- **Frontend:** React + Vite + Tailwind
- **Backend:** Node + Express + Prisma + SQLite (Replit persistent)
- **AI:** OpenAI API (GPT‑5 for text; Whisper for ASR). Emotion classifier: rules + LLM (MVP).
- **Auth:** Anonymous device session; optional email magic link (later).
- **Crypto:** AES‑GCM in browser (optional) before transit. Server also encrypts at rest.

---

## 6) Data Model (Prisma)
```prisma
model User {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  plan         String   @default("free")
  reflections  Reflection[]
  settings     Json?
}

model Reflection {
  id           String   @id @default(cuid())
  userId       String
  createdAt    DateTime @default(now())
  // Raw user text (ciphertext if client-side AES is enabled)
  inputText    String
  // AI outputs
  emotion      String   // Joy|Calm|Anxious|Sad|Angry|Confused|Mixed
  summary      String
  reframe      String
  actions      String?  // JSON array string of action tips
  // Signals
  voice        Boolean  @default(false)
  sentiment    Float?   // -1..1
  energy       Float?   // 0..1 proxy
  meta         Json?
  User         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
}
```

---

## 7) API Design (REST)
### POST `/api/reflections`
Create a reflection from text (and optional voice transcript).
```json
{
  "inputText": "I feel behind at work and guilty about resting.",
  "clientEnc": true
}
```
**Response**
```json
{
  "id": "rfx_123",
  "emotion": "Anxious",
  "summary": "You’re overwhelmed by deadlines and fear disappointing others.",
  "reframe": "Feeling behind doesn’t mean you’re failing; it’s a signal to re-scope and rest.",
  "actions": ["List 3 tasks; commit to 45-min focus; schedule 15-min walk"]
}
```

### GET `/api/reflections?cursor=...`
List reflections (paginated).

### DELETE `/api/reflections/:id`
Delete one.

### POST `/api/analyze/voice` (V1)
Upload short audio → returns transcript + tone metrics.

---

## 8) AI Prompting (MVP)
**System prompt (llm.ts)**
```
You are EchoMind, a concise, compassionate reflection assistant.
Goals: (1) name the primary emotion, (2) reflect and validate,
(3) reframe into agency, (4) suggest 1–3 tiny actions.
Constraints: Max 140 words total; plain language; never diagnose.
Output JSON: {emotion, summary, reframe, actions[]}
Tone: calm, respectful, non-judgmental.
```

**User prompt template**
```
User text: """{{inputText}}"""
Context:
- Past 3 emotions: {{recentEmotionsCSV}}
- Time of day: {{localTime}}
Return JSON only.
```

**Fallback (LLM down):** rules-based sentiment (simple lexicon) + templated reframe.

---

## 9) Frontend UX (key screens)
### A) Home / Chat
- Large input box + mic button.
- “Mindwave” ambient animation reacts to typing/speaking.
- Submit → show **Reflection Card** with: Emotion chip, Summary, Reframe, 1–3 Actions.

### B) Timeline
- Vertical list of cards (reverse-chronological).
- Top shows **Mood Streak** and 7‑day sparkline.

### C) Daily Recap
- “Today you felt mostly *Calm*; your energy rose after lunch.”
- One suggested micro‑action for tomorrow.

### D) Settings / Privacy
- Toggle **Client‑side encryption** (enter passphrase).
- Export JSON, Delete All, Clear Local Cache.

**Wireframe (ASCII)**
```
┌ EchoMind ───────────────────────────────┐
│ [ ● Listening ]  ⏺ mic                │
│ "Type or speak what's on your mind..."  │
│ [ Send ]                                │
├ Reflection Card ────────────────────────┤
│ 😌 Emotion: Calm                         │
│ Summary: You found clarity after naming │
│ your worries about deadlines.           │
│ Reframe: You can choose the smallest    │
│ next step and still rest.               │
│ Actions: [ 15‑min focus ] [ 2‑min tidy ]│
└─────────────────────────────────────────┘
```

---

## 10) Security & Privacy
- **Client‑side AES‑GCM** (crypto.ts) with user passphrase (never sent).
- **At rest:** server encrypts fields with per‑user keys (dotenv secret + salt).
- **Transport:** HTTPS only.
- **Delete all** endpoint wipes DB rows and any audio blobs.
- **Privacy page:** clear, human language.

**Env**
```
OPENAI_API_KEY=
ENCRYPTION_KEY= # 32 bytes base64 for server-side AES
APP_BASE_URL=
```

---

## 11) Analytics & Ethics
- Minimal privacy-preserving analytics: route counts, latency, errors, feature use (no content).
- Red flags: if AI detects self-harm intent, return **gentle, non-diagnostic** crisis resources based on country (config file). *No automated escalation without consent.*

---

## 12) Monetization (later toggle)
- Free: 7‑day history, text reflections.
- **Echo+ ($4.99/mo):** voice, extended history, export, mood graph.
- **Pro ($9.99/mo):** coach mode, mindmaps, custom affirmations.
- Corporate wellness plan.

---

## 13) Replit Build Steps (end‑to‑end)
1. **Create Replit** → “Node.js” template (Nix enabled).  
2. Add folders as in architecture; add `package.json` for **server** and **web** (use PNPM workspaces or two separate repls; single‑repl is fine with concurrent scripts).
3. Install deps:
   ```bash
   # root
   npm i -D typescript ts-node nodemon concurrently
   npm i express cors zod dotenv openai prisma @prisma/client bcryptjs
   npm i cryptr jose uuid
   # web
   cd web && npm create vite@latest web -- --template react-ts
   npm i axios jotai zustand tailwindcss postcss autoprefixer recharts
   ```
4. **Prisma**
   ```bash
   npx prisma init
   npx prisma migrate dev --name init
   ```
5. Add `.env` with `OPENAI_API_KEY` and `ENCRYPTION_KEY`.
6. **Dev scripts** (root `package.json`):
   ```json
   {
     "scripts": {
       "dev": "concurrently \"npm:dev:server\" \"npm:dev:web\"",
       "dev:server": "nodemon --watch server --exec ts-node server/index.ts",
       "dev:web": "cd web && npm run dev"
     }
   }
   ```
7. **Expose ports**: server (3000), web (5173) → optionally proxy `/api` in Vite.
8. **Test flow**: submit text → receive JSON → render card → persist in DB.
9. **Enable mic**; add `/api/analyze/voice` later.

---

## 14) Example Server Snippets
**`server/services/llm.ts`**
```ts
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function reflect(inputText: string, recent:string[] = []) {
  const sys = `You are EchoMind... (see spec JSON above)`;
  const user = `User text: """${inputText}"""\nPast 3 emotions: ${recent.join(", ")}\nReturn JSON only.`;
  const res = await client.chat.completions.create({
    model: "gpt-5.0", // or latest available
    messages: [{ role: "system", content: sys }, { role: "user", content: user }],
    response_format: { type: "json_object" }
  });
  return JSON.parse(res.choices[0].message.content!);
}
```

**`server/routes/reflections.ts`**
```ts
import { Router } from "express";
import { z } from "zod";
import { reflect } from "../services/llm";
import { prisma } from "../db/client";
const r = Router();

r.post("/", async (req, res) => {
  const schema = z.object({ inputText: z.string().min(1), clientEnc: z.boolean().optional() });
  const { inputText } = schema.parse(req.body);
  const analysis = await reflect(inputText);
  const saved = await prisma.reflection.create({ data: { inputText, ...analysis, userId: req.user.id } });
  res.json(saved);
});

r.get("/", async (req,res)=>{
  const list = await prisma.reflection.findMany({ where:{ userId: req.user.id }, orderBy:{ createdAt: "desc" }, take: 50 });
  res.json(list);
});

r.delete("/:id", async (req,res)=>{
  await prisma.reflection.delete({ where:{ id: req.params.id, } });
  res.json({ ok: true });
});

export default r;
```

---

## 15) Testing Plan
- **Unit:** prompt function returns valid JSON, emotion ∈ allowed set.
- **Integration:** POST /reflections creates row; GET lists it.
- **UX:** Enter 3 sample texts → verify reflections under 140 words, actionable.
- **Load:** 20 concurrent requests, p95 latency < 2.5s.
- **Privacy:** With client‑side AES on, DB entry is unreadable plaintext.

---

## 16) Acceptance Criteria (MVP)
- Users can submit text and receive **emotion + summary + reframe + 1–3 actions**.
- Reflections persist and list in timeline.
- Daily recap screen aggregates last 24h.
- “Delete all” works and visibly empties timeline.
- Basic brand styling present (colors/typography).
- README guides setup and env correctly.

---

## 17) Future Enhancements
- Voice tone features, mindmaps, coach mode, wearables.
- iOS/Android wrapper via Capacitor.
- Fine‑tuned emotion model when data & consent allow.

---

## 18) Replit AI Work Orders (paste to Replit Agent)
1. **Scaffold repo** exactly as in Section 5.  
2. Implement Prisma models and migrations (Section 6).  
3. Build REST endpoints (Section 7) with Zod validation + error middleware.  
4. Implement LLM wrapper (Section 8) using response_format JSON.  
5. Build React UI (Section 9) with Tailwind and components (Chat, Card, Timeline).  
6. Add color/theme and typography (Section 3).  
7. Implement client‑side AES option (Settings) with passphrase saved only in localStorage.  
8. Create Daily Recap page and streak sparkline.  
9. Write basic tests (Section 15).  
10. Verify Acceptance Criteria (Section 16).

---

## 19) Example User Stories
- “As a student, I want to speak my worries and get a calming summary so I can study again.”
- “As a founder, I want patterns of my stressors so I can plan better weeks.”
- “As a private person, I want encryption I control so I feel safe to be honest.”

---

## 20) License & Credits
- © 2025 EchoMind. For internal prototyping only.  
- Uses OpenAI APIs and open-source libraries under respective licenses.
