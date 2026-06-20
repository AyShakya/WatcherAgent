---
name: Warm Paper
colors:
  surface: '#fff8f3'
  surface-dim: '#dfd9d4'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ed'
  surface-container: '#f3ede8'
  surface-container-high: '#eee7e2'
  surface-container-highest: '#e8e1dd'
  on-surface: '#1e1b18'
  on-surface-variant: '#4a454d'
  inverse-surface: '#33302d'
  inverse-on-surface: '#f6efeb'
  outline: '#7b757e'
  outline-variant: '#ccc4ce'
  surface-tint: '#68577c'
  primary: '#645377'
  on-primary: '#ffffff'
  primary-container: '#7d6b91'
  on-primary-container: '#fff7ff'
  inverse-primary: '#d3bee9'
  secondary: '#934930'
  on-secondary: '#ffffff'
  secondary-container: '#fd9e7e'
  on-secondary-container: '#76331b'
  tertiary: '#62612f'
  on-tertiary: '#ffffff'
  tertiary-container: '#b0ae75'
  on-tertiary-container: '#424113'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eedbff'
  primary-fixed-dim: '#d3bee9'
  on-primary-fixed: '#231435'
  on-primary-fixed-variant: '#504063'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59d'
  on-secondary-fixed: '#390c00'
  on-secondary-fixed-variant: '#76331b'
  tertiary-fixed: '#e8e5a8'
  tertiary-fixed-dim: '#ccc98e'
  on-tertiary-fixed: '#1d1d00'
  on-tertiary-fixed-variant: '#4a491a'
  background: '#fff8f3'
  on-background: '#1e1b18'
  surface-variant: '#e8e1dd'
  paper-bg: '#F9F7F2'
  paper-surface: '#F2EFE9'
  warm-gray: '#969088'
  ink-black: '#242220'
typography:
  display:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

The design system moves away from the cold, neon-saturated aesthetic of traditional AI interfaces toward a warm, intellectual, and human-centric atmosphere. It evokes the tactile sensation of archival paper, ink on parchment, and high-end editorial publishing. The goal is to provide a "calm-tech" experience that feels like a sophisticated tool rather than a flashy gadget.

The visual style is a blend of **Minimalism** and **Editorial Design**. It prioritizes high legibility, generous whitespace, and a low-stimulus environment. This "warm-mode" approach reduces eye strain while maintaining a premium, professional presence suitable for thoughtful collaboration and complex data analysis.

## Colors

The palette is anchored in organic, earthy tones. The primary background (`paper-bg`) uses a soft cream to avoid the harshness of pure white, while the text utilizes a deep charcoal (`ink-black`) for optimal contrast without the vibration of pure black.

- **Primary (Muted Purple):** Used for primary actions and highlights, suggesting intelligence and sophistication.
- **Secondary (Clay):** Used for accents, warnings, or secondary focus points, grounding the palette in a natural feel.
- **Warm Grays:** Used for subtle borders, secondary text, and iconography to maintain the monochromatic "warm-mode" feel.
- **Surface Tiers:** Backgrounds transition from `#F9F7F2` (global) to `#F2EFE9` (container surfaces) to create soft depth.

## Typography

This design system uses a sophisticated pairing of a modern transitional serif for headings and a clean, utilitarian sans-serif for functional text.

- **Headings (Source Serif 4):** Provides a literary, authoritative character. The larger sizes feature tighter letter spacing for a compact, editorial look.
- **Body & Labels (Inter):** Chosen for its exceptional legibility at small sizes. The wide variety of weights allows for clear hierarchy in data-heavy views.
- **Hierarchy:** Use the `label-md` role with uppercase styling for section headers and metadata to provide a clear contrast against body text.

## Layout & Spacing

The layout philosophy follows a **fixed-center grid** for content-heavy pages and a **flexible sidebar layout** for application consoles.

- **Grid:** A 12-column grid is used for desktop. 
- **Whitespace:** Emphasize generous margins and vertical rhythm. Padding inside containers should be ample (minimum 24px-32px) to prevent the UI from feeling cluttered.
- **Mobile:** Breakpoints at 600px and 900px. On mobile, margins shrink to 16px, and multi-column layouts stack vertically.
- **Rhythm:** All spacing increments should be multiples of the 8px unit to ensure visual harmony.

## Elevation & Depth

This design system rejects heavy, dramatic shadows in favor of **Tonal Layers** and **Low-contrast Outlines**. 

- **Depth Tiers:** Instead of lifting elements with shadows, depth is communicated by shifting background colors. The base page is the lightest, and interactive or grouped elements sit on slightly darker surfaces (`paper-surface`).
- **Outlines:** Use subtle 1px borders (using the `warm-gray` at 20-30% opacity) to define boundaries.
- **Shadows:** When necessary for high-level modals or dropdowns, use "Ambient Shadows"—extremely soft, large-radius blurs (20px-40px) with very low opacity (5-8%) and a slight warm tint to match the paper theme.

## Shapes

The shape language is approachable yet structured. Rounded corners are applied consistently across all components to soften the UI, but they stop short of being "bubbly."

- **Base Radius:** 8px (`0.5rem`) for standard components like buttons, input fields, and cards.
- **Large Radius:** 16px (`1rem`) for larger layout containers or distinct feature blocks.
- **Consistency:** Avoid using sharp 0px corners, as they conflict with the "warm and human" brand personality.

## Components

- **Buttons:** Primary buttons use the muted purple with white or cream text. Secondary buttons should be ghost-style with a subtle border and no fill. Use generous horizontal padding (24px+).
- **Input Fields:** Use a solid background (`paper-surface`) with a very light border. Focus states should be indicated by a slightly thicker primary-colored border, not a glow.
- **Cards:** Cards should not have shadows by default. Use a 1px border or a subtle tonal shift to separate them from the background.
- **Chips/Badges:** Use the secondary clay color at low opacity for background fills with high-contrast text for status indicators.
- **Lists:** Use light horizontal dividers rather than boxes to separate list items, maintaining the open, "paper" feel.
- **Navigation:** The sidebar should use a slightly darker version of the neutral palette to provide a clear anchor for the application's structure.