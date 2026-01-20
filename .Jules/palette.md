## 2024-05-22 - Icon-Only Button Accessibility
**Learning:** This app frequently uses icon-only buttons (Camera, Mute, Close) without `aria-label` or visible text, making them inaccessible to screen readers.
**Action:** Always verify icon-only buttons have `aria-label`, especially those hidden on mobile or purely graphical.

## 2024-05-22 - Range Input Accessibility
**Learning:** Range inputs for image adjustments often lack semantic `<label>` associations, making them opaque to screen readers despite having visual text labels.
**Action:** Always link visual labels to range inputs using `htmlFor` and `id`.

## 2024-05-22 - Hidden UX Delight
**Learning:** Adding double-click-to-reset on sliders is a powerful, low-friction UX enhancement that delights power users without cluttering the UI.
**Action:** Look for opportunities to add "invisible" shortcuts like double-click resets or keyboard hotkeys for common actions.
