# Offline support + Accessibility tests

Two independent tracks. Both are sizable; I'll ship them in one pass but keep them isolated.

## 1. PWA — App shell + cached subscription data

### Heads-up (important)
- Service workers **do not run in the Lovable editor preview** (iframes + preview hosts auto-unregister them). You'll only see offline behavior on the published `joy-bills.lovable.app` site.
- Caching is sticky. Misconfigured SW can pin users to a stale build. Mitigations baked into the plan below.
- Manifest fields like `start_url`/`display` get pinned at PWA install time on iOS/Android.

### Approach
- Add `vite-plugin-pwa` with `registerType: "autoUpdate"`, `devOptions.enabled: false`.
- Workbox config:
  - `NetworkFirst` for HTML navigations (3s timeout) so deploys propagate.
  - `StaleWhileRevalidate` for JS/CSS and Google Fonts.
  - `CacheFirst` for images (avatars, icons).
  - `navigateFallbackDenylist`: `/~oauth`, `/api/`, `/_serverFn/`.
- Web manifest (`/manifest.webmanifest`): name, short_name, theme/background colors from design tokens, icons, `display: "standalone"`, `start_url: "/app"`.
- **Registration guard** in `src/main.tsx`: skip and unregister when in iframe or `*.lovableproject.com` / `id-preview--` host.
- A small `src/lib/pwa.ts` exposes `registerPWA()` invoked from `main.tsx`.

### Cached subscription data (read-only offline)
- New `src/lib/offline-cache.ts` using `idb-keyval` (tiny IndexedDB wrapper).
- Cache layer in `useSubscription`-adjacent code path:
  - On successful fetch in `app.index.tsx`, persist `{ subs, savings, fetchedAt }` to IDB keyed by `user.id`.
  - On mount, hydrate state from IDB immediately (instant render), then refresh from network. If network fails and we have cache → keep showing cached data + show an "Offline — showing last synced data (HH:MM)" badge.
- Same pattern for `usePriceAlerts` (alerts list).
- No write queueing — writes still require network and toast an error if offline (`navigator.onLine === false`).

### Files
- New: `src/lib/pwa.ts`, `src/lib/offline-cache.ts`, `src/components/OfflineBadge.tsx`, `public/sw-kill.js` (kept in tree but not used yet).
- Edited: `vite.config.ts`, `src/main.tsx`, `public/manifest.webmanifest`, `src/routes/app.index.tsx`, `src/hooks/usePriceAlerts.ts`, `src/routes/__root.tsx` (link tags).

## 2. Accessibility — checklist + tests

### Checklist
- New `docs/accessibility-checklist.md`: focus visible, focus trap on dialogs, Esc closes, labelled controls, semantic headings, color contrast, target ≥44px, reduced motion respected, aria-live for toasts.

### Vitest + @testing-library + jest-axe (component-level)
- Add deps: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `jest-axe`, `@types/jest-axe`.
- `vitest.config.ts` with jsdom + setup file (`src/test/setup.ts`) registering jest-dom + jest-axe matchers.
- Tests:
  - `src/test/dialog.a11y.test.tsx` — provider-cancel dialog: renders with no axe violations, focus lands on "Not now" on open, Esc closes, Tab cycles within dialog, action button has aria-label.
  - `src/test/subscription-form.a11y.test.tsx` — every input has an associated label, required fields have `aria-required`, error messages linked via `aria-describedby`, no axe violations.

### Playwright + @axe-core/playwright (E2E smoke)
- Add deps: `@playwright/test`, `@axe-core/playwright`.
- `playwright.config.ts` against `http://localhost:8080` (Vite default), mobile + desktop projects.
- Tests in `e2e/`:
  - `e2e/landing.a11y.spec.ts` — load `/`, run axe, expect zero serious/critical violations.
  - `e2e/login.a11y.spec.ts` — load `/login`, axe scan, tab through inputs, submit reachable via Enter.
- Note in README that Playwright tests need `bunx playwright install` once.

### Scripts
- `package.json`: `"test": "vitest run"`, `"test:ui": "vitest"`, `"test:e2e": "playwright test"`.

## Out of scope
- Write queueing / conflict resolution for offline edits.
- Background sync / push notifications.
- CI wiring (GitHub Actions) for the new tests.

## Risk notes
- After publishing the PWA, removing it later requires shipping a kill-switch SW (already drafted in `public/sw-kill.js` for future use).
- Cached subscription data is per-device; clearing site data wipes it. RLS still enforced server-side — IDB is just a local mirror.