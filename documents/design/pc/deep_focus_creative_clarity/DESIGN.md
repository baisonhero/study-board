---
name: Deep Focus & Creative Clarity
colors:
  surface: '#0d1518'
  surface-dim: '#0d1518'
  surface-bright: '#323a3e'
  surface-container-lowest: '#070f12'
  surface-container-low: '#151d20'
  surface-container: '#192124'
  surface-container-high: '#232b2e'
  surface-container-highest: '#2e3639'
  on-surface: '#dbe4e8'
  on-surface-variant: '#c2c7c8'
  inverse-surface: '#dbe4e8'
  inverse-on-surface: '#2a3235'
  outline: '#8c9292'
  outline-variant: '#424848'
  surface-tint: '#b6cacc'
  primary: '#b6cacc'
  on-primary: '#213335'
  primary-container: '#1a2c2e'
  on-primary-container: '#809496'
  inverse-primary: '#4f6264'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#adc6ff'
  on-tertiary: '#002e6a'
  tertiary-container: '#00275c'
  on-tertiary-container: '#4c8dff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d2e6e8'
  primary-fixed-dim: '#b6cacc'
  on-primary-fixed: '#0c1e20'
  on-primary-fixed-variant: '#384a4c'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#0d1518'
  on-background: '#dbe4e8'
  surface-variant: '#2e3639'
typography:
  h1-display:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2-editorial:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-reading:
    fontFamily: Newsreader
    fontSize: 19px
    fontWeight: '400'
    lineHeight: '1.6'
  ui-main:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
  ui-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  ui-caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-padding: 32px
  gutter: 20px
---

## Brand & Style
The design system is centered on the intersection of cognitive calm and creative momentum. It moves away from the utilitarian coldness of traditional markdown editors toward a "Digital Sanctuary" aesthetic—an environment that encourages deep work through visual silence and premium finishes.

The visual style is a hybrid of **Minimalism** and **Soft Glassmorphism**. It prioritizes heavy whitespace and a reduction of "UI noise" to keep the user's focus on their thoughts. Depth is established through translucent layers and high-end background blurs rather than heavy borders, creating a lightweight, breathable interface that feels native to both macOS and iOS. The emotional goal is to evoke a sense of quiet luxury and intellectual readiness.

## Colors
The palette is anchored by **Forest Ink** (#1A2C2E), a deep, desaturated green-indigo hybrid designed to reduce eye strain during long writing sessions. 

- **Primary:** Forest Ink provides the structural base and primary surface tint.
- **Accents:** **Soft Amber** (#F59E0B) is used exclusively for motivational triggers, progress indicators, and "aha!" moments. **Electric Blue** (#3B82F6) serves as the functional accent for links, active states, and focus cursors.
- **Surface Strategy:** In dark mode, surfaces use varying opacities of the primary color over a near-black neutral base. In light mode, the system shifts to a high-end paper white (#F8FAFC) with subtle cool-grey shadows to maintain the premium publication feel.

## Typography
This design system employs a dual-font strategy to distinguish between the "System" (navigation/tools) and the "Content" (the user's thoughts).

- **UI & Navigation:** **Inter** is used for all functional elements. It provides a clean, neutral framework that feels responsive and precise. Labels and captions use slightly increased tracking for clarity at small sizes.
- **Long-form Content:** **Newsreader** is utilized for the note-taking experience. Its editorial proportions and sophisticated serifs transform a digital note into a high-end publication, making the act of writing feel more significant and intentional.
- **Hierarchy:** Headlines use a tight, bold Inter for a modern feel, while sub-headers transition into Newsreader to bridge the gap between the interface and the content.

## Layout & Spacing
The layout follows a **Fluid Grid** model with generous safe areas to mimic the margins of a physical book. 

- **Desktop (macOS):** A 12-column grid with wide 32px margins. The central writing column is constrained to a max-width of 720px to ensure optimal line length for readability, with sidebars "floating" using glassmorphic backgrounds.
- **Mobile (iOS):** A flexible single-column layout. Horizontal padding is aggressive (24px) to create a "premium boutique" feel, avoiding the cramped edge-to-edge look of standard utility apps.
- **Rhythm:** All spacing is derived from a 4px baseline. Components use `lg` (24px) spacing to separate major sections, ensuring the "Creative Clarity" theme is maintained through intentional whitespace.

## Elevation & Depth
Depth is expressed through **Glassmorphism** and **Ambient Shadows** rather than solid fills.

1.  **Base Layer:** The darkest/lightest solid neutral background.
2.  **Middle Layer (Sidebars/Panels):** Background blur (20px to 30px) with a 60% opacity tint of the primary color. A 1px low-contrast border (#FFFFFF10 in dark mode) defines the edge.
3.  **Floating Layer (Modals/Popovers):** Higher transparency, increased blur, and a highly diffused, tinted shadow (Color: Forest Ink, Alpha: 0.15, Blur: 40px).

This stacking logic ensures that the user always understands the hierarchy of information through light refraction and "physical" layering.

## Shapes
The shape language is consistently **Rounded** (Level 2). This softens the technical nature of a note-taking app, making it feel more approachable and organic.

- **Standard Components:** Buttons and inputs use 0.5rem (8px).
- **Cards & Containers:** Large content blocks and glass panels use 1rem (16px) to emphasize the "container" feel.
- **Active States:** Selection indicators in lists use a 0.25rem (4px) radius to maintain a crisp, precise look within the softer layout.

## Components
- **Buttons:** Primary buttons use a subtle gradient of the Primary color with a soft top-glow. Secondary buttons are "Ghost" style with a glassmorphic blur on hover.
- **Note Cards:** In gallery views, cards utilize a soft 1px border and ambient shadows. No heavy headers; instead, typography and whitespace create the structure.
- **The "Focus Bar":** A specialized floating bottom-bar on iOS and a top-centered bar on macOS. It uses a heavy backdrop blur and contains only the most essential formatting tools to minimize distraction.
- **Input Fields:** Minimalist design—no background fill when inactive. On focus, they reveal a soft glass background and an Electric Blue cursor.
- **Chips/Tags:** Pill-shaped with a low-opacity tint of the accent colors (Soft Amber for metadata, Blue for links).
- **Lists:** High-density text but with wide horizontal margins. Hover states use a translucent Forest Ink highlight with rounded corners.