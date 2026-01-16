## 2024-05-22 - Icon-Only Button Accessibility
**Learning:** This app frequently uses icon-only buttons (Camera, Mute, Close) without `aria-label` or visible text, making them inaccessible to screen readers.
**Action:** Always verify icon-only buttons have `aria-label`, especially those hidden on mobile or purely graphical.

## 2024-05-23 - Interactive Divs vs Buttons
**Learning:** Found grid items using `div` with `onClick`, which excludes keyboard users. Converting to `button` required adding `w-full` to maintain grid layout.
**Action:** When fixing interactive `div`s, always switch to `<button>` for semantic a11y, but verify layout dimensions (block vs inline) and override defaults if needed.
