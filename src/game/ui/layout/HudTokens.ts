/**
 * Design tokens for the Beast Link Battle landscape UI.
 */
export const HudTokens = {
  colors: {
    // Backgrounds & Surfaces
    bgApp: 0x0b0f17,
    bgGame: 0x0f172a,
    bgSurface: 0x1e293b,
    bgSurfaceElevated: 0x243242,
    bgSurfaceLight: 0x334155,
    bgSurfaceDark: 0x111827,

    // Strokes & Borders
    strokeDefault: 0x334155,
    strokeHighlight: 0x475569,
    strokeGold: 0xf59e0b,
    strokeBlue: 0x3b82f6,
    strokeRed: 0xef4444,

    // Brand & Semantic
    gold: 0xfbbf24,
    goldDark: 0xd97706,
    goldMuted: 0x78350f,
    blue: 0x3b82f6,
    blueDark: 0x1d4ed8,
    blueLight: 0x93c5fd,
    red: 0xef4444,
    redDark: 0x991b1b,
    redLight: 0xfca5a5,
    green: 0x22c55e,
    greenDark: 0x15803d,
    greenLight: 0x86efac,

    // Text (HEX strings for Phaser text)
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textDark: '#0f172a',
    textGold: '#fbbf24',
    textBlue: '#60a5fa',
    textRed: '#f87171',
    textGreen: '#4ade80',
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
