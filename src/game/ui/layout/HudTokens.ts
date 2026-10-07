/**
 * Design tokens for the Beast Link Battle landscape UI.
 */
export const HudTokens = {
  colors: {
    // Backgrounds & Surfaces
    bgApp: 0x11152b,
    bgGame: 0x171d36,
    bgSurface: 0x242c4a,
    bgSurfaceElevated: 0x303b60,
    bgSurfaceLight: 0x435077,
    bgSurfaceDark: 0x151a31,

    // Strokes & Borders
    strokeDefault: 0x46516f,
    strokeHighlight: 0x64739d,
    strokeGold: 0xe9bd59,
    strokeBlue: 0x72bff5,
    strokeRed: 0xee7185,

    // Brand & Semantic
    gold: 0xf6d675,
    goldDark: 0xc4943f,
    goldMuted: 0x70542e,
    blue: 0x72bff5,
    blueDark: 0x407cb8,
    blueLight: 0xbce4ff,
    red: 0xee7185,
    redDark: 0x98495a,
    redLight: 0xffbbc5,
    green: 0x72d9ad,
    greenDark: 0x3a956f,
    greenLight: 0xb9f1d8,

    // Text (HEX strings for Phaser text)
    textPrimary: '#fff8ef',
    textSecondary: '#dfe6ff',
    textMuted: '#9ba8c7',
    textDark: '#171d36',
    textGold: '#f6d675',
    textBlue: '#89d0ff',
    textRed: '#ff91a1',
    textGreen: '#8be2bd',
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
