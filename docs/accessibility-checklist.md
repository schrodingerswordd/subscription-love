# Accessibility checklist

A pragmatic checklist for SubTrack. Run through this for every new screen,
dialog, or form.

## Keyboard
- [ ] All interactive elements reachable with `Tab` in a logical order.
- [ ] No keyboard traps (except inside open dialogs, which must trap on purpose).
- [ ] `Esc` closes any open dialog, popover, or sheet.
- [ ] `Enter` activates the primary action when focus is on a default button.
- [ ] Custom widgets respect arrow keys where standard (tabs, menus, sliders).

## Focus
- [ ] Visible focus ring on every interactive element (no `outline: none` without a replacement).
- [ ] Dialogs focus the safest control on open (Cancel/dismiss for destructive flows).
- [ ] Returning from a dialog restores focus to the trigger.

## Labels & semantics
- [ ] Every form input has an associated `<label>` or `aria-label`.
- [ ] Buttons rendered as icons have `aria-label`.
- [ ] Headings form a hierarchy with a single `<h1>` per route.
- [ ] Status changes use `role="status"` / `aria-live="polite"`; errors use `role="alert"`.

## ARIA
- [ ] Dialogs: `aria-labelledby` (title) and `aria-describedby` (description).
- [ ] Required fields: `aria-required="true"`.
- [ ] Field errors: `aria-invalid="true"` + `aria-describedby` linking to the message.

## Visuals
- [ ] Text contrast ≥ 4.5:1 (WCAG AA), large text ≥ 3:1.
- [ ] Tap targets ≥ 44×44 CSS px on mobile.
- [ ] Color is never the only signal (pair with icon or text).
- [ ] Respect `prefers-reduced-motion`: disable non-essential animation.

## Tests
- Component tests: `bun run test` (Vitest + jest-axe).
- E2E smoke: `bun run test:e2e` (Playwright + axe-core). First run: `bunx playwright install`.
