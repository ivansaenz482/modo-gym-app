import { useSeasonStore, Season } from '../store/seasonStore';

// Paleta semántica por temporada (tendencias 2026: dark mode + gradientes neón + glow)
export type SeasonPalette = {
  primary: string;
  primaryDark: string;
  accent: string;
  glow: string;
  gradient: [string, string, string];
  heroGradient: [string, string, string];
  drawerGradient: [string, string];
  background: string;
  surface: string;
  surface2: string;
  border: string;
  tabBar: string;
  onPrimary: string;
};

export const DEFAULT_PALETTE: SeasonPalette = {
  primary: '#E10600',
  primaryDark: '#B30500',
  accent: '#00D1FF',
  glow: 'rgba(225,6,0,0.45)',
  gradient: ['#E10600', '#FF6B35', '#0A0A0F'],
  heroGradient: ['rgba(225,6,0,0.72)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.8)'],
  drawerGradient: ['#1A1A24', '#0A0A0F'],
  background: '#0A0A0F',
  surface: '#15151C',
  surface2: '#1E1E28',
  border: '#2A2A35',
  tabBar: '#15151C',
  onPrimary: '#FFFFFF',
};

export const HALLOWEEN_PALETTE: SeasonPalette = {
  primary: '#FF7A18',          // calabaza neón
  primaryDark: '#C2410C',
  accent: '#B388FF',           // púrpura neón
  glow: 'rgba(255,122,24,0.55)',
  gradient: ['#FF7A18', '#A855F7', '#120718'],
  heroGradient: ['rgba(255,122,24,0.55)', 'rgba(88,28,135,0.72)', 'rgba(11,6,20,0.92)'],
  drawerGradient: ['#1A1024', '#0B0614'],
  background: '#0B0614',       // negro violáceo
  surface: '#1A1024',
  surface2: '#241634',
  border: '#3A2450',
  tabBar: '#160C22',
  onPrimary: '#0B0614',
};

export function useSeasonPalette(): { season: Season; isHalloween: boolean; palette: SeasonPalette } {
  const season = useSeasonStore((s) => s.season);
  const isHalloween = season === 'halloween';
  return { season, isHalloween, palette: isHalloween ? HALLOWEEN_PALETTE : DEFAULT_PALETTE };
}
