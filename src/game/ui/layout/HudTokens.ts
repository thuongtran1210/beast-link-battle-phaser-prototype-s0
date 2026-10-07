/**
 * Design tokens for the Beast Link Battle landscape UI.
 */
export const HudTokens = {
  colors: {
    // Backgrounds & Surfaces
    bgApp: 0x070d1d,
    bgGame: 0x0b1228,
    bgSurface: 0x121d3b,
    bgSurfaceElevated: 0x1a2850,
    bgSurfaceLight: 0x293b69,
    bgSurfaceDark: 0x091126,

    // Celestial / neon phase surfaces
    bgPhase: 0x0d1833,
    bgPhaseSoft: 0x15244a,
    bgPhaseGlow: 0x20164a,

    // Strokes & Borders
    strokeDefault: 0x334c7d,
    strokeHighlight: 0x6086c2,
    strokeGold: 0xf7c84b,
    strokeBlue: 0x3fc8ff,
    strokeViolet: 0xa66bff,
    strokePink: 0xff5aa8,
    strokeGreen: 0x45e3a5,
    strokeRed: 0xf26b82,

    // Brand & Semantic
    gold: 0xffd95c,
    goldDark: 0xc4943f,
    goldMuted: 0x70542e,
    blue: 0x35c6ff,
    blueDark: 0x407cb8,
    blueLight: 0xbce4ff,
    red: 0xee7185,
    redDark: 0x98495a,
    redLight: 0xffbbc5,
    green: 0x42e0a4,
    greenDark: 0x3a956f,
    greenLight: 0xb9f1d8,

    // Text (HEX strings for Phaser text)
    textPrimary: '#f7f7ff',
    textSecondary: '#d7e3ff',
    textMuted: '#91a3c9',
    textDark: '#171d36',
    textGold: '#ffdb62',
    textBlue: '#73dbff',
    textRed: '#ff91a1',
    textGreen: '#7ff0c5',
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
