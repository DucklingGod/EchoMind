# EchoMind - AI Emotional Mirror

## Overview

EchoMind is an AI-powered emotional reflection and journaling application designed to help users process their feelings through conversational AI. The application allows users to share their thoughts via text or voice input, receiving empathetic AI-generated reflections that validate emotions, reframe perspectives, and suggest actionable steps. Built with a calm-tech philosophy inspired by mental wellness leaders like Calm and Headspace, EchoMind prioritizes minimal cognitive load and emotional safety.

**Core Features:**
- Text and voice input for emotional reflections
- AI-powered emotion detection and analysis using OpenAI GPT-4o
- Reflection cards with emotion categorization, summaries, reframes, and action items
- Timeline view with mood tracking and streak visualization
- Mood sparkline charts showing 7-day emotional trends
- Dark/light theme support
- Data export functionality
- Client-side AES-256-GCM encryption for privacy (optional)

**Target Users:**
- Stressed workers and students seeking mental clarity
- Creators and founders managing creative chaos
- Neurodivergent individuals translating emotions into structured meaning

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React 18+ with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component Library:** Radix UI primitives with shadcn/ui styling system, providing accessible, unstyled components that can be customized. The "new-york" style variant is used throughout.

**Styling:** Tailwind CSS with custom design tokens for calm-tech aesthetics. The color system uses HSL values with CSS custom properties for theming:
- Primary: `#6C63FF` (Violet Blue) for insight and focus
- Secondary: Soft Rose for empathy
- Accent: Cyan for progress indicators
- Background/foreground variations for light and dark modes

**Routing:** wouter for lightweight client-side routing (Home, Timeline, Settings pages).

**State Management:** 
- TanStack Query (React Query) for server state management, caching, and data fetching
- React hooks (useState, useContext) for local component state
- Custom ThemeProvider context for theme persistence
- Custom EncryptionProvider context for encryption state and passphrase management

**Design Philosophy:**
- Glassmorphism effects with backdrop blur
- Minimal cognitive load during emotional moments
- Thumb-reachable mobile interactions
- Consistent spacing using Tailwind's spacing primitives (2, 4, 6, 8, 12, 16, 20, 24)
- Typography using Inter font family for readability

### Backend Architecture

**Framework:** Express.js with TypeScript, using ES modules.

**Server Structure:**
- `server/index.ts`: Main entry point with middleware setup and request logging
- `server/routes.ts`: API route handlers for reflections and voice transcription
- `server/storage.ts`: Abstracted storage interface with PostgreSQL implementation
- `server/db.ts`: Neon PostgreSQL connection with Drizzle ORM

**Storage Strategy:** Using PostgreSQL via Neon serverless with Drizzle ORM (`PgStorage` class). The interface (`IStorage`) supports:
- User management (create, retrieve)
- Reflection CRUD operations with proper indexing and relationships
- Bulk deletion operations
- Automatic schema migrations via `npm run db:push`

**Implementation:** PostgreSQL provides persistent storage with ACID compliance, ensuring data durability across server restarts. The Neon serverless adapter uses WebSocket connections for efficient database access in serverless environments.

### Data Models

**User Schema:**
```typescript
{
  id: string
  createdAt: Date
  plan: string (default: "free")
  settings?: {
    clientEncryption?: boolean
    passphrase?: string
  }
}
```

**Reflection Schema:**
```typescript
{
  id: string
  userId: string
  createdAt: Date
  inputText: string
  emotion: Emotion (enum: Joy, Calm, Anxious, Sad, Angry, Confused, Mixed)
  summary: string
  reframe: string
  actions: string[]
  voice: boolean
  sentiment?: number
  energy?: number
}
```

**Design Decision:** Emotions are constrained to 7 predefined categories to maintain consistency in mood tracking and visualization. The schema includes optional sentiment and energy fields for future analytics enhancements.

### AI Integration

**Provider:** OpenAI API using GPT-5 (latest model as of implementation).

**Service Layer:** `server/services/llm.ts` handles all AI interactions with:
- Emotion classification from user input
- Empathetic summary generation
- Perspective reframing
- Actionable suggestion creation

**Context Awareness:** The AI receives recent emotional context (last 3 emotions) to provide more personalized responses and detect patterns.

**Fallback Strategy:** If AI analysis fails, the system provides a generic but empathetic fallback response to maintain user experience continuity.

**Constraints:**
- Responses limited to ~140 words for clarity
- JSON-formatted output for structured data
- Never diagnoses mental health conditions
- Maintains non-judgmental, calm tone

### Voice Processing

**Recording:** Browser MediaRecorder API with automatic mime type detection (webm/ogg fallback).

**Transcription:** OpenAI Whisper API (`whisper-1` model) for speech-to-text conversion.

**Workflow:** 
1. Client captures audio using `useVoiceRecording` hook
2. Audio blob uploaded to `/api/transcribe` endpoint
3. Server transcribes via Whisper API
4. Transcribed text processed like text input
5. Temporary audio file cleaned up server-side

**Design Choice:** Client-side recording reduces server load and allows real-time feedback during recording. Transcription happens server-side to protect API keys and handle file processing securely.

### Client-Side Encryption

**Implementation:** Optional AES-256-GCM encryption for reflection privacy using Web Crypto API.

**Encryption Layer:** `client/src/lib/encryption.ts` provides:
- AES-256-GCM symmetric encryption with random IV per encryption
- PBKDF2 key derivation (100,000 iterations, SHA-256)
- Random salt generation for each key derivation
- TypeScript interfaces for encrypted data structure

**State Management:** `EncryptionProvider` context tracks:
- `isEnabled`: Encryption preference stored in localStorage (persists across sessions)
- `hasPassphrase`: Current session passphrase availability (sessionStorage only)
- Separation allows encryption to stay enabled after browser restart while requiring passphrase re-entry

**Encryption Workflow:**
1. User enables encryption in Settings and enters passphrase (minimum 8 characters)
2. Passphrase stored in sessionStorage, enabled flag in localStorage
3. Before submitting reflection, Home encrypts `inputText` using current passphrase
4. Encrypted payload (ciphertext, salt, IV) sent to server
5. Server stores encrypted data without decryption capability
6. ReflectionCard automatically decrypts content when passphrase available
7. On browser close, passphrase cleared; encryption stays enabled but requires re-entry

**Security Features:**
- Zero-knowledge: Server never sees plaintext or passphrase
- No passphrase recovery (user responsibility to remember)
- Encrypted reflections use AI fallback responses (server can't analyze ciphertext)
- Lock icon shown when decryption fails or passphrase unavailable
- Submission blocked when encryption enabled but passphrase missing

**User Experience:**
- Settings shows three states:
  - Disabled: Passphrase input to enable
  - Enabled + passphrase present: Success message with security info
  - Enabled + passphrase missing: Warning with re-entry input
- Clear warnings about fallback AI responses for encrypted content
- Toast notifications guide user through passphrase management

**Trade-offs:**
- Encrypted reflections receive generic AI analysis (server can't read content)
- No passphrase recovery mechanism (by design for zero-knowledge)
- Requires passphrase re-entry after browser restart
- Slightly increased client-side processing for encrypt/decrypt operations

## External Dependencies

### Third-Party APIs

1. **OpenAI API** (Required)
   - GPT-4o for reflection analysis and emotion detection
   - Whisper-1 for voice transcription
   - Environment variable: `OPENAI_API_KEY`

### Database

**Active:** PostgreSQL via Neon serverless with Drizzle ORM
- Connection string: `DATABASE_URL` environment variable
- WebSocket support: Configured with `ws` package for Neon serverless
- Schema: `./shared/schema.ts` with Drizzle table definitions
- Configuration: `drizzle.config.ts`
- Migrations: Automatic via `npm run db:push`

**Tables:**
- `users`: User accounts with settings (JSONB for flexible configuration)
- `reflections`: Emotional reflections with foreign key to users, array support for actions

**Key Features:**
- Automatic UUID generation for primary keys
- Foreign key constraints ensuring data integrity
- Timestamp defaults for created_at fields
- JSONB for flexible settings storage
- Array support for action items

### UI Component Libraries

- **Radix UI**: Accessible, unstyled component primitives for complex interactions (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui**: Pre-styled component patterns built on Radix UI
- **Recharts**: Data visualization for mood sparkline charts

### Development Tools

- **Vite**: Build tool and development server with HMR
- **Replit Plugins**: 
  - Runtime error overlay for development
  - Cartographer for code navigation
  - Dev banner for environment indication

### Utilities

- **date-fns**: Date manipulation and formatting
- **wouter**: Lightweight routing (~1.2KB)
- **zod**: Schema validation for API inputs
- **multer**: Multipart form data handling for file uploads
- **class-variance-authority**: Type-safe variant styling
- **tailwind-merge**: Utility for merging Tailwind classes

### Build & Runtime

- **TypeScript**: Strict mode enabled for type safety
- **tsx**: TypeScript execution for development
- **esbuild**: Production build bundling for server code