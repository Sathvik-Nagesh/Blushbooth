## 2024-05-22 - Icon-Only Button Accessibility
**Learning:** This app frequently uses icon-only buttons (Camera, Mute, Close) without `aria-label` or visible text, making them inaccessible to screen readers.
**Action:** Always verify icon-only buttons have `aria-label`, especially those hidden on mobile or purely graphical.

## 2024-05-23 - Interactive Elements Semantics
**Learning:** `div` elements with `onClick` handlers were used for the photo grid, making them inaccessible to keyboard users.
**Action:** Convert interactive `div`s to `<button>` elements to ensure built-in keyboard support (Tab, Enter/Space) and semantic correctness.
