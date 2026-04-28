export const Colors = {
  // Core backgrounds
  bg: '#07000F',
  bgCard: '#0D0520',
  bgGlass: 'rgba(255,255,255,0.05)',
  bgGlassStrong: 'rgba(255,255,255,0.10)',

  // Neon palette
  primary: '#7C3AED',      // deep violet
  primaryLight: '#A855F7', // bright purple
  secondary: '#06B6D4',    // cyan
  secondaryLight: '#67E8F9',
  accent: '#EC4899',       // hot pink
  accentLight: '#F9A8D4',
  gold: '#F59E0B',
  goldLight: '#FCD34D',
  green: '#10B981',
  greenLight: '#6EE7B7',
  red: '#EF4444',
  redLight: '#FCA5A5',

  // Text
  textPrimary: '#F0E6FF',
  textSecondary: '#A78BCA',
  textMuted: '#6B5A7E',
  white: '#FFFFFF',

  // Borders
  border: 'rgba(124,58,237,0.3)',
  borderLight: 'rgba(124,58,237,0.15)',

  // Overlays
  overlay: 'rgba(7,0,15,0.85)',
  overlayLight: 'rgba(7,0,15,0.6)',
};

export const Gradients = {
  primary: ['#7C3AED', '#4F46E5'],
  primaryVibrant: ['#A855F7', '#7C3AED', '#4F46E5'],
  secondary: ['#06B6D4', '#0891B2'],
  accent: ['#EC4899', '#BE185D'],
  gold: ['#F59E0B', '#D97706'],
  success: ['#10B981', '#059669'],
  danger: ['#EF4444', '#DC2626'],
  hero: ['#7C3AED', '#06B6D4'],
  heroFull: ['#A855F7', '#7C3AED', '#06B6D4'],
  dark: ['#1a0533', '#07000F'],
  card: ['rgba(124,58,237,0.15)', 'rgba(6,182,212,0.05)'],
  glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'],
  battle: ['#EC4899', '#7C3AED', '#06B6D4'],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
  hero: 48,
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

export const Shadows = {
  glow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  glowCyan: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 16,
  },
  glowGold: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 16,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  none: {},
};

export default { Colors, Gradients, Spacing, Radius, FontSize, FontWeight, Shadows };
