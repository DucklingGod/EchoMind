# EchoMind Design Guidelines

## Design Approach

**Selected Approach**: Custom Design System with Calm-Tech Principles

Drawing inspiration from mental wellness leaders like Calm, Headspace, and productivity tools like Notion, we'll create a minimal, emotionally safe interface that prioritizes quick capture and reflective reading. The glassmorphism aesthetic provides depth without clutter, while maintaining the serious, trustworthy feel of a mental health tool.

**Core Principles**:
- Minimize cognitive load during emotional moments
- Create breathing room around content
- Prioritize thumb-reachable interactions for mobile
- Use motion sparingly and meaningfully
- Build trust through clarity and consistency

---

## Typography

**Font Family**: Inter (via Google Fonts CDN)
- Primary: Inter for all UI elements
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale**:
- Hero/Display: text-4xl (36px) / font-semibold / leading-tight
- Page Title: text-3xl (30px) / font-semibold / leading-snug
- Section Header: text-2xl (24px) / font-semibold / leading-snug
- Card Title: text-xl (20px) / font-medium / leading-normal
- Body Large: text-lg (18px) / font-normal / leading-relaxed
- Body: text-base (16px) / font-normal / leading-relaxed
- Body Small: text-sm (14px) / font-normal / leading-relaxed
- Caption: text-xs (12px) / font-medium / leading-normal / uppercase / tracking-wide

**Reading Optimization**:
- Max-width for body text: max-w-2xl (672px)
- Reflection content: leading-relaxed (1.625)
- Action items: leading-normal (1.5)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

**Responsive Breakpoints**:
- Mobile: base (default, 375px+)
- Tablet: md: (768px+)
- Desktop: lg: (1024px+)

**Page Structure**:
- Mobile: Single column, full-width with px-4 side padding
- Tablet: px-6 to px-8, max-w-3xl centered
- Desktop: px-8, max-w-6xl centered

**Common Patterns**:
- Card padding: p-6 (mobile) / p-8 (desktop)
- Section spacing: py-12 (mobile) / py-16 (tablet) / py-20 (desktop)
- Element spacing within cards: space-y-4
- Button groups: gap-4
- Form fields: space-y-6

**Grid System** (for Timeline/Multi-card views):
- Mobile: grid-cols-1
- Tablet: grid-cols-1 (maintain single column for readability)
- Desktop: grid-cols-1 with wider max-width

---

## Component Library

### Input Components

**Primary Input Field** (Chat/Reflection Entry):
- Large, prominent textarea
- min-h-32 (mobile) / min-h-40 (tablet+)
- Rounded corners: rounded-2xl
- Glassmorphic backdrop with subtle border
- Focus state: subtle glow/border emphasis
- Placeholder text: text-base, muted opacity
- Auto-resize as user types (up to max-h-96)

**Microphone Button**:
- Fixed circular button: w-14 h-14
- Positioned bottom-right of input area or floating
- Pulsing animation when recording (subtle scale)
- Icon: microphone symbol, clearly visible
- Touch target: minimum 44x44px

**Form Fields** (Settings):
- Standard height: h-12
- Rounded: rounded-lg
- Border with subtle shadow
- Label above: text-sm, mb-2
- Helper text below: text-xs, muted

### Card Components

**Reflection Card**:
- Container: rounded-2xl, p-6 md:p-8
- Glassmorphic background with backdrop blur
- Subtle shadow for depth
- Border: 1px subtle border

Card Structure:
1. Header: timestamp (text-xs, muted) + emotion chip (inline)
2. Summary: text-lg, font-medium, mb-4
3. Reframe section: text-base, leading-relaxed, mb-6
4. Actions: flex gap-3, wrapped pills/buttons
5. Footer: delete icon (subtle, right-aligned)

**Emotion Chip**:
- Inline badge: px-3 py-1, rounded-full
- Text: text-sm font-medium
- Position: top-right of card or inline with timestamp
- Visual indicator (emoji or small icon) + label

**Action Pills**:
- Compact buttons: px-4 py-2, rounded-full
- Text: text-sm
- Checkable state (optional): outline default, filled when tapped
- Touch-friendly spacing: gap-3

### Navigation

**Bottom Tab Bar** (Mobile):
- Fixed bottom, full-width
- Height: h-16
- Three primary tabs: Home (chat), Timeline, Settings
- Icons + labels (icon on top, label below)
- Active state: distinct visual treatment
- Safe area padding for iOS notch

**Top Navigation** (Tablet/Desktop):
- Horizontal nav or sidebar
- Logo/branding left
- Navigation links: flex gap-8
- User menu/settings: right-aligned

### Data Display

**Mood Streak Indicator**:
- Horizontal bar showing consecutive days
- Small circular badges for each day
- Current streak number: large, prominent
- Max width: full on mobile, contained on desktop

**7-Day Sparkline** (Mood Graph):
- Minimalist line chart
- Height: h-24
- X-axis: day labels (M, T, W, etc.)
- Y-axis: hidden or minimal
- Single color gradient fill
- Touch/hover: show exact value

**Daily Recap Panel**:
- Prominent card: rounded-2xl, p-8
- Large summary text: text-xl
- Dominant emotion: large icon or visual
- Key insight: text-lg, mb-6
- Tomorrow's micro-action: highlighted button or pill

**Timeline List**:
- Vertical stack: space-y-6
- Reverse chronological
- Date separators: text-xs, uppercase, py-4, border-t
- Load more: centered button at bottom
- Empty state: centered illustration + gentle copy

### Overlays

**Modal Dialogs**:
- Backdrop: semi-transparent overlay
- Modal: max-w-md, rounded-2xl, p-8
- Title: text-2xl, mb-4
- Body: text-base, mb-8
- Actions: flex justify-end gap-4

**Bottom Sheet** (Mobile):
- Slide up from bottom
- Rounded top corners: rounded-t-3xl
- Drag handle: centered gray bar
- Padding: p-6
- Used for: settings, delete confirmation, insights

**Notification/Toast**:
- Fixed top-center or bottom-center
- Auto-dismiss after 3-4 seconds
- Compact: px-6 py-3, rounded-full
- Icon + message: flex gap-3

### Buttons

**Primary CTA**:
- Height: h-12 (mobile) / h-14 (desktop)
- Rounded: rounded-xl
- Text: text-base font-semibold
- Full-width on mobile, min-w-40 on desktop
- Padding: px-8

**Secondary Button**:
- Same dimensions as primary
- Outlined or ghost style
- Text: text-base font-medium

**Icon Button**:
- Square: w-10 h-10 (or w-12 h-12 for primary actions)
- Rounded: rounded-lg
- Centered icon

**Floating Action Button** (FAB):
- Circular: w-16 h-16
- Fixed position: bottom-right, 20px offset
- Shadow: prominent drop shadow
- Used for: new reflection (mobile)

---

## Glassmorphism Implementation

**Card/Panel Treatment**:
- Background: semi-transparent white/dark overlay
- Backdrop filter: blur(12px) to blur(20px)
- Border: 1px solid with semi-transparent white
- Shadow: soft, elevated (not harsh)
- Avoid overuse: apply to cards, modals, navigation

**Layering**:
- Background: solid or gradient
- Layer 1: Main content cards (slight blur)
- Layer 2: Modals/overlays (stronger blur)
- Layer 3: Tooltips/popovers (minimal blur)

---

## Responsive Patterns

**Mobile-First Considerations**:
- Thumb zone: primary actions in bottom 2/3 of screen
- Input at bottom with mic button easily reachable
- Navigation via bottom tabs
- Swipe gestures: swipe card left for delete
- Single-column layouts throughout

**Tablet Adaptations**:
- Two-column layout for settings (form left, preview right)
- Wider max-width for reflection cards
- Side navigation option
- Floating panels for insights

**Desktop Enhancements**:
- Sidebar navigation (left or right)
- Multi-panel view: chat left, timeline right
- Hover states on cards
- Keyboard shortcuts indicated

---

## Accessibility

- Minimum touch targets: 44x44px (iOS) / 48x48px (Android)
- Color contrast: WCAG AA minimum for all text
- Focus indicators: visible ring/outline on all interactive elements
- Screen reader labels: all icons and actions
- Semantic HTML: proper heading hierarchy, landmarks
- Form validation: inline error messages, aria-live announcements
- Reduced motion: respect prefers-reduced-motion for animations

---

## Animation Strategy

**Micro-interactions** (subtle only):
- Button press: gentle scale(0.98)
- Card entry: fade-in with slight slide-up
- Modal: fade backdrop + scale modal from 0.95 to 1
- Tab switch: crossfade content
- Success states: gentle checkmark animation

**Ambient Animation**:
- "Mindwave" visualization on home: subtle SVG wave or particle effect
- Responds to typing/speaking: minimal amplitude increase
- Low motion, calming pace

**Transitions**:
- Duration: 200-300ms for most interactions
- Easing: ease-out for entries, ease-in-out for state changes
- Page transitions: simple fade or slide

---

## Images

**Hero Section** (Home/Landing):
- No traditional hero image
- Instead: animated gradient background with subtle wave/particle overlay
- Focus on immediate input functionality

**Empty States**:
- Illustration for empty timeline: small, centered, friendly
- Style: minimalist line art, consistent with calm aesthetic
- Image size: max 240px wide

**Settings/Privacy Pages**:
- Optional header illustration for visual interest
- Abstract, calming imagery (clouds, waves, organic shapes)
- Not required - text-first approach acceptable

**No stock photos**: Avoid generic wellness imagery; rely on color, typography, and subtle graphics

---

## Platform-Specific Considerations

**Mobile Safari (iOS)**:
- Safe area insets: pb-safe for bottom navigation
- Prevent zoom on input focus: use font-size-16px minimum
- Smooth scroll: -webkit-overflow-scrolling: touch

**Android**:
- Material-inspired ripple effects optional
- Back button handling for modals
- Status bar color coordination

**Progressive Web App**:
- Add to home screen: display: standalone
- Theme color in manifest
- Splash screen with brand gradient
- Offline state: gentle message, cached reflections accessible