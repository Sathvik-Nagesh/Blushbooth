## 2024-05-22 - Icon-Only Button Accessibility
**Learning:** This app frequently uses icon-only buttons (Camera, Mute, Close) without `aria-label` or visible text, making them inaccessible to screen readers.
**Action:** Always verify icon-only buttons have `aria-label`, especially those hidden on mobile or purely graphical.

## 2024-05-23 - State Indication for Selection Controls
**Learning:** Visual selection states (like background color changes) in button groups are often invisible to screen readers.
**Action:** Use `aria-pressed="true"` for button-based selection groups or `role="tab"` for tab interfaces to explicitly communicate the active state.
