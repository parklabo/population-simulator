export interface CountryData {
  id: string;
  name: string;
  nameKr: string;
  population: number; // in millions
  birthRate: number;
  deathRate: number;
  lifeExpectancy: number;
  continent: string;
  lat: number;
  lng: number;
  color: string;
  flag: string;
}

export const worldCountries: CountryData[] = [
  // Asia - Critical
  { id: 'KR', name: 'South Korea', nameKr: '대한민국', population: 51.8, birthRate: 0.72, deathRate: 7.3, lifeExpectancy: 83, continent: 'Asia', lat: 37.5665, lng: 126.9780, color: '#FF0000', flag: '🇰🇷' },
  { id: 'JP', name: 'Japan', nameKr: '일본', population: 125.8, birthRate: 1.26, deathRate: 11.1, lifeExpectancy: 84, continent: 'Asia', lat: 35.6762, lng: 139.6503, color: '#FF4500', flag: '🇯🇵' },
  { id: 'CN', name: 'China', nameKr: '중국', population: 1411.0, birthRate: 1.40, deathRate: 7.4, lifeExpectancy: 77, continent: 'Asia', lat: 39.9042, lng: 116.4074, color: '#FF6B6B', flag: '🇨🇳' },
  { id: 'TW', name: 'Taiwan', nameKr: '대만', population: 23.6, birthRate: 0.90, deathRate: 7.8, lifeExpectancy: 81, continent: 'Asia', lat: 25.0330, lng: 121.5654, color: '#FF0000', flag: '🇹🇼' },
  { id: 'SG', name: 'Singapore', nameKr: '싱가포르', population: 5.9, birthRate: 0.85, deathRate: 5.1, lifeExpectancy: 83, continent: 'Asia', lat: 1.3521, lng: 103.8198, color: '#FF0000', flag: '🇸🇬' },
  { id: 'HK', name: 'Hong Kong', nameKr: '홍콩', population: 7.5, birthRate: 0.77, deathRate: 7.2, lifeExpectancy: 85, continent: 'Asia', lat: 22.3193, lng: 114.1694, color: '#FF0000', flag: '🇭🇰' },
  { id: 'TH', name: 'Thailand', nameKr: '태국', population: 70.0, birthRate: 1.51, deathRate: 8.3, lifeExpectancy: 77, continent: 'Asia', lat: 13.7563, lng: 100.5018, color: '#FFA500', flag: '🇹🇭' },
  
  // Europe - Critical
  { id: 'IT', name: 'Italy', nameKr: '이탈리아', population: 60.3, birthRate: 1.20, deathRate: 11.3, lifeExpectancy: 83, continent: 'Europe', lat: 41.9028, lng: 12.4964, color: '#FF4500', flag: '🇮🇹' },
  { id: 'ES', name: 'Spain', nameKr: '스페인', population: 47.4, birthRate: 1.16, deathRate: 9.5, lifeExpectancy: 83, continent: 'Europe', lat: 40.4168, lng: -3.7038, color: '#FF4500', flag: '🇪🇸' },
  { id: 'DE', name: 'Germany', nameKr: '독일', population: 83.2, birthRate: 1.49, deathRate: 11.5, lifeExpectancy: 81, continent: 'Europe', lat: 52.5200, lng: 13.4050, color: '#FF6B6B', flag: '🇩🇪' },
  { id: 'PL', name: 'Poland', nameKr: '폴란드', population: 37.8, birthRate: 1.35, deathRate: 11.2, lifeExpectancy: 78, continent: 'Europe', lat: 52.2297, lng: 21.0122, color: '#FF4500', flag: '🇵🇱' },
  { id: 'PT', name: 'Portugal', nameKr: '포르투갈', population: 10.3, birthRate: 1.31, deathRate: 11.0, lifeExpectancy: 82, continent: 'Europe', lat: 38.7223, lng: -9.1393, color: '#FF4500', flag: '🇵🇹' },
  { id: 'GR', name: 'Greece', nameKr: '그리스', population: 10.7, birthRate: 1.32, deathRate: 11.6, lifeExpectancy: 82, continent: 'Europe', lat: 37.9838, lng: 23.7275, color: '#FF4500', flag: '🇬🇷' },
  { id: 'FR', name: 'France', nameKr: '프랑스', population: 67.4, birthRate: 1.80, deathRate: 9.4, lifeExpectancy: 82, continent: 'Europe', lat: 48.8566, lng: 2.3522, color: '#FFA500', flag: '🇫🇷' },
  { id: 'GB', name: 'United Kingdom', nameKr: '영국', population: 67.7, birthRate: 1.65, deathRate: 9.3, lifeExpectancy: 81, continent: 'Europe', lat: 51.5074, lng: -0.1278, color: '#FFA500', flag: '🇬🇧' },
  
  // Americas
  { id: 'US', name: 'United States', nameKr: '미국', population: 331.9, birthRate: 1.70, deathRate: 8.7, lifeExpectancy: 79, continent: 'Americas', lat: 38.9072, lng: -77.0369, color: '#FFA500', flag: '🇺🇸' },
  { id: 'CA', name: 'Canada', nameKr: '캐나다', population: 38.2, birthRate: 1.50, deathRate: 7.8, lifeExpectancy: 82, continent: 'Americas', lat: 45.4215, lng: -75.6972, color: '#FFA500', flag: '🇨🇦' },
  { id: 'BR', name: 'Brazil', nameKr: '브라질', population: 215.3, birthRate: 1.75, deathRate: 6.8, lifeExpectancy: 76, continent: 'Americas', lat: -15.7975, lng: -47.8919, color: '#FFA500', flag: '🇧🇷' },
  { id: 'MX', name: 'Mexico', nameKr: '멕시코', population: 128.9, birthRate: 2.05, deathRate: 6.3, lifeExpectancy: 75, continent: 'Americas', lat: 19.4326, lng: -99.1332, color: '#90EE90', flag: '🇲🇽' },
  
  // Oceania
  { id: 'AU', name: 'Australia', nameKr: '호주', population: 25.7, birthRate: 1.65, deathRate: 6.7, lifeExpectancy: 83, continent: 'Oceania', lat: -35.2809, lng: 149.1300, color: '#FFA500', flag: '🇦🇺' },
  { id: 'NZ', name: 'New Zealand', nameKr: '뉴질랜드', population: 5.1, birthRate: 1.70, deathRate: 6.9, lifeExpectancy: 82, continent: 'Oceania', lat: -41.2865, lng: 174.7762, color: '#FFA500', flag: '🇳🇿' },
  
  // Africa - Higher birth rates
  { id: 'NG', name: 'Nigeria', nameKr: '나이지리아', population: 213.4, birthRate: 5.32, deathRate: 11.8, lifeExpectancy: 55, continent: 'Africa', lat: 9.0820, lng: 8.6753, color: '#00FF00', flag: '🇳🇬' },
  { id: 'EG', name: 'Egypt', nameKr: '이집트', population: 104.3, birthRate: 3.30, deathRate: 5.8, lifeExpectancy: 72, continent: 'Africa', lat: 30.0444, lng: 31.2357, color: '#90EE90', flag: '🇪🇬' },
  { id: 'ZA', name: 'South Africa', nameKr: '남아프리카', population: 60.0, birthRate: 2.30, deathRate: 9.4, lifeExpectancy: 64, continent: 'Africa', lat: -33.9249, lng: 18.4241, color: '#90EE90', flag: '🇿🇦' },
  
  // Middle East
  { id: 'SA', name: 'Saudi Arabia', nameKr: '사우디아라비아', population: 35.0, birthRate: 2.30, deathRate: 3.4, lifeExpectancy: 75, continent: 'Asia', lat: 24.7136, lng: 46.6753, color: '#90EE90', flag: '🇸🇦' },
  { id: 'IL', name: 'Israel', nameKr: '이스라엘', population: 9.4, birthRate: 3.00, deathRate: 5.3, lifeExpectancy: 83, continent: 'Asia', lat: 31.7683, lng: 35.2137, color: '#90EE90', flag: '🇮🇱' },
  { id: 'AE', name: 'UAE', nameKr: '아랍에미리트', population: 10.0, birthRate: 1.40, deathRate: 1.5, lifeExpectancy: 78, continent: 'Asia', lat: 24.4539, lng: 54.3773, color: '#FF6B6B', flag: '🇦🇪' },
  
  // South Asia
  { id: 'IN', name: 'India', nameKr: '인도', population: 1417.0, birthRate: 2.20, deathRate: 7.3, lifeExpectancy: 70, continent: 'Asia', lat: 28.6139, lng: 77.2090, color: '#90EE90', flag: '🇮🇳' },
  { id: 'PK', name: 'Pakistan', nameKr: '파키스탄', population: 231.4, birthRate: 3.50, deathRate: 6.9, lifeExpectancy: 67, continent: 'Asia', lat: 33.6844, lng: 73.0479, color: '#90EE90', flag: '🇵🇰' },
  { id: 'BD', name: 'Bangladesh', nameKr: '방글라데시', population: 169.4, birthRate: 2.00, deathRate: 5.5, lifeExpectancy: 73, continent: 'Asia', lat: 23.8103, lng: 90.4125, color: '#90EE90', flag: '🇧🇩' }
];

export function getCountryColor(birthRate: number): string {
  if (birthRate < 1.0) return '#FF0000'; // Red - Extreme
  if (birthRate < 1.5) return '#FF4500'; // Orange Red - Severe
  if (birthRate < 2.1) return '#FFA500'; // Orange - Critical
  return '#00FF00'; // Green - Stable
}

export function getCrisisLevel(birthRate: number): string {
  if (birthRate < 1.0) return 'EXTREME';
  if (birthRate < 1.5) return 'SEVERE';
  if (birthRate < 2.1) return 'CRITICAL';
  return 'STABLE';
}