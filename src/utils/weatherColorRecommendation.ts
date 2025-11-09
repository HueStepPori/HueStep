// 계절 및 날씨 기반 색상 추천 시스템

interface ColorRecommendation {
  color: string;
  name: string;
  desc: string;
}

// 계절 판별
export function getSeason(date: Date): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = date.getMonth() + 1; // 0-11 -> 1-12
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// 계절별 색상 팔레트
const seasonalColors: Record<string, ColorRecommendation[]> = {
  spring: [
    { color: '#FFB3D9', name: 'Cherry Blossom', desc: '벚꽃' },
    { color: '#B5E550', name: 'Fresh Green', desc: '새싹' },
    { color: '#FFE4E1', name: 'Peach', desc: '복숭아' },
    { color: '#B4D455', name: 'Spring Green', desc: '봄' },
    { color: '#87CEEB', name: 'Sky Blue', desc: '봄 하늘' },
    { color: '#FFB6C1', name: 'Pink', desc: '핑크' },
  ],
  summer: [
    { color: '#4CC9F0', name: 'Ocean', desc: '오션' },
    { color: '#06A77D', name: 'Emerald', desc: '에메랄드' },
    { color: '#FFD60A', name: 'Sunshine', desc: '선샤인' },
    { color: '#FF9F1C', name: 'Sunset', desc: '석양' },
    { color: '#0077B6', name: 'Deep Blue', desc: '바다' },
    { color: '#40916C', name: 'Tropical', desc: '열대' },
  ],
  autumn: [
    { color: '#F77F00', name: 'Maple', desc: '단풍' },
    { color: '#DC143C', name: 'Crimson', desc: '진홍' },
    { color: '#FF8C42', name: 'Pumpkin', desc: '호박' },
    { color: '#B57EDC', name: 'Lavender', desc: '라벤더' },
    { color: '#8D99AE', name: 'Gray', desc: '회색' },
    { color: '#2D6A4F', name: 'Forest', desc: '숲' },
  ],
  winter: [
    { color: '#EDF2F4', name: 'Snow', desc: '눈' },
    { color: '#457B9D', name: 'Winter Sky', desc: '겨울 하늘' },
    { color: '#2B2D42', name: 'Midnight', desc: '미드나이트' },
    { color: '#6FBADC', name: 'Ice Blue', desc: '아이스 블루' },
    { color: '#1D3557', name: 'Navy', desc: '네이비' },
    { color: '#B57EDC', name: 'Purple', desc: '퍼플' },
  ],
};

// 날씨 기반 색상 (실제로는 날씨 API를 사용하겠지만, 여기서는 시뮬레이션)
const weatherColors: Record<string, ColorRecommendation[]> = {
  sunny: [
    { color: '#FFD60A', name: 'Sunshine', desc: '선샤인' },
    { color: '#FFC947', name: 'Golden', desc: '골든' },
    { color: '#FF9F1C', name: 'Amber', desc: '앰버' },
  ],
  cloudy: [
    { color: '#8D99AE', name: 'Gray', desc: '구름' },
    { color: '#EDF2F4', name: 'Pearl', desc: '펄' },
    { color: '#B57EDC', name: 'Lavender', desc: '라벤더' },
  ],
  rainy: [
    { color: '#457B9D', name: 'Rain', desc: '빗방울' },
    { color: '#6FBADC', name: 'Aqua', desc: '아쿠아' },
    { color: '#2B2D42', name: 'Stormy', desc: '먹구름' },
  ],
  snowy: [
    { color: '#EDF2F4', name: 'Snow', desc: '눈' },
    { color: '#87CEEB', name: 'Winter Sky', desc: '겨울 하늘' },
    { color: '#6FBADC', name: 'Frost', desc: '서리' },
  ],
};

// 시간대별 색상
const timeColors: Record<string, ColorRecommendation[]> = {
  morning: [
    { color: '#FFE4E1', name: 'Dawn', desc: '새벽' },
    { color: '#FFB6C1', name: 'Morning Pink', desc: '아침' },
    { color: '#87CEEB', name: 'Morning Sky', desc: '아침 하늘' },
  ],
  afternoon: [
    { color: '#FFD60A', name: 'Noon', desc: '정오' },
    { color: '#4CC9F0', name: 'Bright Sky', desc: '맑은 하늘' },
    { color: '#06A77D', name: 'Emerald', desc: '에메랄드' },
  ],
  evening: [
    { color: '#FF8C42', name: 'Sunset', desc: '석양' },
    { color: '#F77F00', name: 'Orange Dusk', desc: '노을' },
    { color: '#E63946', name: 'Twilight', desc: '황혼' },
  ],
  night: [
    { color: '#1D3557', name: 'Night Sky', desc: '밤하늘' },
    { color: '#2B2D42', name: 'Midnight', desc: '자정' },
    { color: '#7209B7', name: 'Night Purple', desc: '밤' },
  ],
};

// 시간대 판별
function getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// 날씨 시뮬레이션 (실제로는 날씨 API 사용)
function getSimulatedWeather(): 'sunny' | 'cloudy' | 'rainy' | 'snowy' {
  const month = new Date().getMonth() + 1;
  const random = Math.random();
  
  // 겨울에는 눈 가능성
  if (month === 12 || month === 1 || month === 2) {
    if (random < 0.2) return 'snowy';
  }
  
  // 장마철 (6-7월)
  if (month === 6 || month === 7) {
    if (random < 0.4) return 'rainy';
  }
  
  if (random < 0.5) return 'sunny';
  if (random < 0.75) return 'cloudy';
  return 'rainy';
}

// 메인 추천 함수
export function getRecommendedColor(): ColorRecommendation {
  const now = new Date();
  const season = getSeason(now);
  const timeOfDay = getTimeOfDay(now);
  const weather = getSimulatedWeather();
  
  // 우선순위: 날씨 > 계절 > 시간대
  let candidates: ColorRecommendation[] = [];
  
  // 30% 확률로 날씨 기반
  if (Math.random() < 0.3 && weatherColors[weather]) {
    candidates = weatherColors[weather];
  }
  // 50% 확률로 계절 기반
  else if (Math.random() < 0.7 && seasonalColors[season]) {
    candidates = seasonalColors[season];
  }
  // 20% 확률로 시간대 기반
  else if (timeColors[timeOfDay]) {
    candidates = timeColors[timeOfDay];
  }
  
  // fallback: 계절 색상
  if (candidates.length === 0) {
    candidates = seasonalColors[season];
  }
  
  // 랜덤 선택
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// 모든 색상 목록 (기존 호환성 유지)
export const allColors: ColorRecommendation[] = [
  // 빨강 계열
  { color: '#E63946', name: 'Cherry Red', desc: '체리' },
  { color: '#DC143C', name: 'Crimson', desc: '진홍' },
  { color: '#FF6B6B', name: 'Coral Red', desc: '코랄 레드' },
  
  // 주황 계열
  { color: '#FF8C42', name: 'Orange Burst', desc: '오렌지' },
  { color: '#F77F00', name: 'Tangerine', desc: '탠저린' },
  { color: '#FF9F1C', name: 'Amber', desc: '앰버' },
  
  // 노랑 계열
  { color: '#FFD60A', name: 'Sunshine', desc: '선샤인' },
  { color: '#FFC947', name: 'Golden', desc: '골든' },
  { color: '#FFEA00', name: 'Lemon', desc: '레몬' },
  
  // 연두 계열
  { color: '#B5E550', name: 'Lime', desc: '라임' },
  { color: '#9ACD32', name: 'Yellow Green', desc: '연두' },
  { color: '#B4D455', name: 'Spring Green', desc: '봄' },
  
  // 초록 계열
  { color: '#06A77D', name: 'Emerald', desc: '에메랄드' },
  { color: '#2D6A4F', name: 'Forest', desc: '숲' },
  { color: '#40916C', name: 'Jade', desc: '제이드' },
  
  // 하늘색 계열
  { color: '#87CEEB', name: 'Sky Blue', desc: '하늘' },
  { color: '#6FBADC', name: 'Ocean', desc: '오션' },
  { color: '#4CC9F0', name: 'Aqua', desc: '아쿠아' },
  
  // 파랑 계열
  { color: '#457B9D', name: 'Steel Blue', desc: '스틸 블루' },
  { color: '#1D3557', name: 'Navy', desc: '네이비' },
  { color: '#0077B6', name: 'Cobalt', desc: '코발트' },
  
  // 보라 계열
  { color: '#B57EDC', name: 'Lavender', desc: '라벤더' },
  { color: '#9D4EDD', name: 'Purple', desc: '퍼플' },
  { color: '#7209B7', name: 'Violet', desc: '바이올렛' },
  
  // 핑크 계열
  { color: '#F72585', name: 'Magenta', desc: '마젠타' },
  { color: '#FFB3D9', name: 'Pink', desc: '핑크' },
  { color: '#FF85B3', name: 'Rose', desc: '로즈' },
  
  // 무채색
  { color: '#2B2D42', name: 'Charcoal', desc: '차콜' },
  { color: '#8D99AE', name: 'Gray', desc: '그레이' },
  { color: '#EDF2F4', name: 'Pearl', desc: '펄' },
];
