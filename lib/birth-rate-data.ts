export interface CountryBirthRate {
  rank: number;
  country: string;
  code: string;
  birthRate: number;
  flag: string;
  region: 'Asia' | 'Europe' | 'Americas' | 'Africa' | 'Oceania';
  criticalLevel: 'extreme' | 'severe' | 'critical' | 'warning' | 'stable';
}

// Data from World Insights statistics
export const birthRateData: CountryBirthRate[] = [
  { rank: 1, country: 'South Korea', code: 'KR', birthRate: 0.72, flag: '🇰🇷', region: 'Asia', criticalLevel: 'extreme' },
  { rank: 2, country: 'Hong Kong', code: 'HK', birthRate: 0.77, flag: '🇭🇰', region: 'Asia', criticalLevel: 'extreme' },
  { rank: 3, country: 'Singapore', code: 'SG', birthRate: 0.85, flag: '🇸🇬', region: 'Asia', criticalLevel: 'extreme' },
  { rank: 4, country: 'Macao', code: 'MO', birthRate: 0.89, flag: '🇲🇴', region: 'Asia', criticalLevel: 'extreme' },
  { rank: 5, country: 'Taiwan', code: 'TW', birthRate: 0.90, flag: '🇹🇼', region: 'Asia', criticalLevel: 'extreme' },
  { rank: 6, country: 'Spain', code: 'ES', birthRate: 1.16, flag: '🇪🇸', region: 'Europe', criticalLevel: 'severe' },
  { rank: 7, country: 'Italy', code: 'IT', birthRate: 1.20, flag: '🇮🇹', region: 'Europe', criticalLevel: 'severe' },
  { rank: 8, country: 'Japan', code: 'JP', birthRate: 1.26, flag: '🇯🇵', region: 'Asia', criticalLevel: 'severe' },
  { rank: 9, country: 'Portugal', code: 'PT', birthRate: 1.31, flag: '🇵🇹', region: 'Europe', criticalLevel: 'severe' },
  { rank: 10, country: 'Greece', code: 'GR', birthRate: 1.32, flag: '🇬🇷', region: 'Europe', criticalLevel: 'severe' },
  { rank: 11, country: 'Cyprus', code: 'CY', birthRate: 1.33, flag: '🇨🇾', region: 'Europe', criticalLevel: 'severe' },
  { rank: 12, country: 'Malta', code: 'MT', birthRate: 1.34, flag: '🇲🇹', region: 'Europe', criticalLevel: 'severe' },
  { rank: 13, country: 'Poland', code: 'PL', birthRate: 1.35, flag: '🇵🇱', region: 'Europe', criticalLevel: 'severe' },
  { rank: 14, country: 'Ukraine', code: 'UA', birthRate: 1.37, flag: '🇺🇦', region: 'Europe', criticalLevel: 'severe' },
  { rank: 15, country: 'China', code: 'CN', birthRate: 1.40, flag: '🇨🇳', region: 'Asia', criticalLevel: 'critical' },
  { rank: 16, country: 'Romania', code: 'RO', birthRate: 1.41, flag: '🇷🇴', region: 'Europe', criticalLevel: 'critical' },
  { rank: 17, country: 'Croatia', code: 'HR', birthRate: 1.45, flag: '🇭🇷', region: 'Europe', criticalLevel: 'critical' },
  { rank: 18, country: 'Bulgaria', code: 'BG', birthRate: 1.46, flag: '🇧🇬', region: 'Europe', criticalLevel: 'critical' },
  { rank: 19, country: 'Austria', code: 'AT', birthRate: 1.48, flag: '🇦🇹', region: 'Europe', criticalLevel: 'critical' },
  { rank: 20, country: 'Germany', code: 'DE', birthRate: 1.49, flag: '🇩🇪', region: 'Europe', criticalLevel: 'critical' },
];

// Replacement rate constant
export const REPLACEMENT_RATE = 2.1;

// Calculate severity based on birth rate
export function getSeverityLevel(birthRate: number): CountryBirthRate['criticalLevel'] {
  if (birthRate < 1.0) return 'extreme';
  if (birthRate < 1.4) return 'severe';
  if (birthRate < 1.7) return 'critical';
  if (birthRate < 2.1) return 'warning';
  return 'stable';
}

// Get color based on severity
export function getSeverityColor(level: CountryBirthRate['criticalLevel']): string {
  switch (level) {
    case 'extreme': return '#991b1b'; // dark red
    case 'severe': return '#dc2626'; // red
    case 'critical': return '#ea580c'; // orange
    case 'warning': return '#ca8a04'; // yellow
    case 'stable': return '#16a34a'; // green
    default: return '#6b7280'; // gray
  }
}

// Calculate population decline percentage
export function calculateDeclineRate(birthRate: number): number {
  const deficit = REPLACEMENT_RATE - birthRate;
  return Math.round((deficit / REPLACEMENT_RATE) * 100);
}