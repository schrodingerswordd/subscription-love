# SubTrack — Subscription Tracking Web App

A mobile-first web app for tracking recurring subscriptions, with a fintech-style UI in blues/purples.

## Scope & Approach

Built with React + TypeScript on TanStack Start, styled with Tailwind, backed by Lovable Cloud (Supabase) for auth and data. Mobile-first responsive design that looks great on phones and scales up to desktop.

**Note on PWA:** Full PWA with service workers causes issues in the Lovable preview. I'll add a web app manifest + icons so users can "Add to Home Screen" with a standalone app feel — no offline service worker. This covers the "installable on phones" need without breaking the editor preview.

## Pages & Routes

- `/` — Landing page (public)
- `/login` — Sign in
- `/signup` — Create account
- `/app` — Dashboard (protected)
- `/app/add` — Add subscription (protected)
- `/app/edit/$id` — Edit subscription (protected)

## Feature Breakdown

### 1. Landing Page
- Hero with product name, tagline ("Never get surprised by a subscription charge again"), CTA buttons (Get Started / Log In)
- 3-up feature grid: Track everything, Visualize spend, Cancel smart
- "How it works" 3-step section
- Mock dashboard preview image/illustration
- Footer

### 2. Authentication
- Email + password sign up and log in via Lovable Cloud
- Auto-confirm email enabled (no email verification step) for fast testing
- Session persisted; protected routes redirect to `/login`
- Logout button in dashboard header

### 3. Dashboard (`/app`)
- **Big total monthly cost** at the top — huge typography, gradient accent, the focal point
- Secondary stats: yearly projection, # active subscriptions, next upcoming charge
- **Spending chart** — area/bar chart showing monthly spend over the last 6 months (Recharts)
- **Subscription list** — each row shows service icon, name, cost, billing cycle badge, next billing date, category tag, edit/delete actions
- Empty state when no subscriptions yet, with CTA to add first one
- Floating "+" button on mobile to add new subscription

### 4. Add / Edit Subscription Form
- Service name (with autocomplete suggestions for common services: Netflix, Spotify, Disney+, YouTube, Apple Music, Amazon Prime, HBO Max, Hulu, Notion, ChatGPT, Adobe, GitHub, etc.)
- Cost (number input with currency prefix)
- Billing cycle: weekly / monthly / yearly (segmented control)
- Next billing date (date picker)
- Category dropdown: Entertainment, Productivity, Fitness, Music, News, Cloud Storage, Gaming, Other
- Auto-assigned brand color + icon when service name matches a known brand
- Save / Cancel; edit screen also has Delete with confirm dialog

### 5. Service Icons & Branding
- Curated list of ~20 popular services with their brand color and icon (Lucide icons + custom SVGs for big brands)
- Fallback: colored circle with first letter for unknown services

## Design System

- **Palette:** Deep indigo/violet primary (`oklch` values), soft blue accents, near-white background, dark navy text. Subtle purple gradient on the total cost card and primary buttons.
- **Typography:** Inter for everything; total cost uses a tight, large display weight
- **Components:** shadcn/ui (Card, Button, Input, Select, Dialog, Badge, Chart) — already in the project
- **Mobile:** Bottom-aligned primary actions, large tap targets, sticky header with total, full-width cards

## Data Model (Lovable Cloud)

`subscriptions` table:
- `id` uuid pk
- `user_id` uuid → auth.users (RLS: user owns rows)
- `name` text
- `cost` numeric
- `billing_cycle` text (`weekly` | `monthly` | `yearly`)
- `next_billing_date` date
- `category` text
- `created_at` timestamptz

RLS policies: authenticated users can select/insert/update/delete only their own rows.

Monthly normalized cost computed client-side: weekly × 4.33, yearly ÷ 12.

## Build Order

1. Landing page + design tokens (blues/purples palette in `styles.css`)
2. Auth: signup, login, protected route guard, Lovable Cloud setup
3. Database schema + RLS for `subscriptions`
4. Dashboard shell: total cost, list, empty state
5. Add / Edit / Delete subscription flow with service icon mapping
6. Spending chart (Recharts)
7. Web app manifest + icons for "Add to Home Screen"
8. Mobile polish pass (floating action button, sticky header, tap targets)

## Out of Scope (for now)

- Push notifications / billing reminders (no service worker)
- Offline mode
- Bank account integration / auto-detect subscriptions
- Multi-currency
- Sharing / household plans

We can add any of these in a follow-up.
