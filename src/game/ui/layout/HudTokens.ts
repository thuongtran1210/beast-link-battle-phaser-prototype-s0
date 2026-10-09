/**
 * Design tokens for the Beast Link Battle landscape UI.
 */
export const HudTokens = {
  colors: {
    // Backgrounds & Surfaces
    bgApp: 0x14221b,
    bgGame: 0x18271f,
    bgSurface: 0x202725,
    bgSurfaceElevated: 0x29322e,
    bgSurfaceLight: 0x39433d,
    bgSurfaceDark: 0x161d1b,

    // Celestial / neon phase surfaces
    bgPhase: 0x202725,
    bgPhaseSoft: 0x29322e,
    bgPhaseGlow: 0x30312d,

    // Strokes & Borders
    strokeDefault: 0x48514e,
    strokeHighlight: 0x66716a,
    strokeGold: 0xc8b58a,
    strokeBlue: 0x7e9caa,
    strokeViolet: 0x9c8aaa,
    strokePink: 0xb78999,
    strokeGreen: 0x8eae92,
    strokeRed: 0xc28f85,

    // Brand & Semantic
    gold: 0xffd95c,
    goldDark: 0xc4943f,
    goldMuted: 0x70542e,
    blue: 0x8bb6bb,
    blueDark: 0x407cb8,
    blueLight: 0xbce4ff,
    red: 0xee7185,
    redDark: 0x98495a,
    redLight: 0xffbbc5,
    green: 0x8dbb93,
    greenDark: 0x3a956f,
    greenLight: 0xb9f1d8,

    // Text (HEX strings for Phaser text)
    textPrimary: '#f4efdf',
    textSecondary: '#d4decb',
    textMuted: '#a0aea6',
    textDark: '#171d36',
    textGold: '#dfc997',
    textBlue: '#a7bdc6',
    textRed: '#ff91a1',
    textGreen: '#b2cbb0',
  },

  fonts: {
    family: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'monospace',
    size: {
      hero: '36px',
      title: '22px',
      h2: '18px',
      h3: '15px',
      body: '13px',
      small: '11px',
      tiny: '9px',
    },
  },

  radii: {
    card: 10,
    button: 6,
    pill: 14,
  },
} as const;

export function drawCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: number = HudTokens.colors.bgSurface,
  fillAlpha = 0.94,
  strokeColor: number = HudTokens.colors.strokeDefault,
  strokeWidth = 1,
): Phaser.GameObjects.Rectangle {
  return scene.add
    .rectangle(x + width / 2, y + height / 2, width, height, fillColor, fillAlpha)
    .setStrokeStyle(strokeWidth, strokeColor);
}
