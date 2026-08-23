export const colors = {
  primary: '#E10600',
  primaryDark: '#B30500',
  primaryLight: '#FF3B30',
  secondary: '#0A0A0F',
  background: '#0A0A0F',
  surface: '#15151C',
  surface2: '#1E1E28',
  surface3: '#2A2A35',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#2A2A35',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  accent: '#00D1FF',
  gold: '#FFD60A',
  gradientStart: '#E10600',
  gradientEnd: '#FF6B35',
} as const;

export const gradients = {
  primary: ['#E10600', '#FF3B30'] as const,
  dark: ['#0A0A0F', '#1A1A24'] as const,
  card: ['#1E1E28', '#15151C'] as const,
  gold: ['#FFD60A', '#FF9500'] as const,
};
