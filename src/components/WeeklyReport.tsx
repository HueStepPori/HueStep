import { TrendingUp, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { adjustBrightness } from '../utils/colorUtils';

// HEX → rgba
const hexToRgba = (hex: string, a = 1) => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// ✅ 단일 색상 전용: 중앙 코어 + 대칭 글로우
const getSingleBlobStyles = (color: string) => {
  const styles: React.CSSProperties[] = [];

  // (1) 중심 코어
  styles.push({
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    background: `
      radial-gradient(circle at 50% 45%,
        ${hexToRgba(adjustBrightness(color, 8), 0.95)} 0%,
        ${hexToRgba(color, 0.90)} 28%,
        ${hexToRgba(color, 0.55)} 55%,
        ${hexToRgba(color, 0.00)} 78%)
    `,
    filter: 'blur(0.8px)',
    opacity: 1,
  } as React.CSSProperties);

  // (2) 균일한 바깥 글로우(대칭)
  styles.push({
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    mixBlendMode: 'screen',
    background: `
      radial-gradient(circle at 50% 60%,
        ${hexToRgba(color, 0.28)} 0%,
        ${hexToRgba(color, 0.16)} 45%,
        ${hexToRgba(color, 0.00)} 85%)
    `,
    filter: 'blur(1.5px)',
    opacity: 0.95,
  } as React.CSSProperties);

  return styles;
};

// ✅ 다색용
const getBlobStyles = (colors: string[]) => {
  if (!colors?.length) return [];

  const LAYERS_PER_COLOR = 2;
  const radius = 42;
  const spread = 10;
  const sizePct = 58;
  const alphaCenter = 0.65;

  const styles: React.CSSProperties[] = [];

  // 중앙 아주 약한 보강
  styles.push({
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    mixBlendMode: 'screen',
    background: `radial-gradient(circle at 50% 50%,
      rgba(255,255,255,0.05) 0%,
      rgba(255,255,255,0.00) 60%)`,
  } as React.CSSProperties);

  colors.forEach((c, i) => {
    const baseAngle = (i / colors.length) * 360;
    for (let k = 0; k < LAYERS_PER_COLOR; k++) {
      const jitter = (k ? 1 : -1) * (spread / 2);
      const angle = ((baseAngle + jitter) * Math.PI) / 180;
      const cx = 50 + radius * Math.cos(angle);
      const cy = 50 + radius * Math.sin(angle);

      styles.push({
        position: 'absolute',
        inset: 0,
        borderRadius: '9999px',
        mixBlendMode: 'screen',
        background: `radial-gradient(circle at ${cx}% ${cy}%,
          ${hexToRgba(adjustBrightness(c, 10), alphaCenter)} 0%,
          ${hexToRgba(c, 0.10)} ${sizePct}%,
          ${hexToRgba(c, 0)} ${sizePct + 12}%)`,
        filter: 'blur(2px)',
        opacity: 0.95,
      } as React.CSSProperties);
    }
  });

  return styles;
};

interface DayMarble {
  date: string;
  colors: string[];
  steps: number;
  distance: number;
}

interface WeeklyReportProps {
  marbles: DayMarble[];
  todayColor: string;
}

export function WeeklyReport({ marbles, todayColor }: WeeklyReportProps) {
  // 최근 7일 데이터
  const recentMarbles = marbles.slice(-7);
  
  // 통계 계산
  const totalSteps = recentMarbles.reduce((sum, m) => sum + m.steps, 0);
  const totalDistance = recentMarbles.reduce((sum, m) => sum + m.distance, 0);
  const totalColors = recentMarbles.reduce((sum, m) => sum + m.colors.length, 0);
  const avgSteps = Math.round(totalSteps / Math.max(recentMarbles.length, 1));

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="mb-2">주간 리포트</h2>
        <p className="text-gray-500">지난 7일간의 걸음을 돌아봐요</p>
      </div>

      {/* 헤더 카드 - 오늘의 컬러 그라데이션 배경 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-3xl p-8 mb-6 text-white shadow-xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${todayColor}, ${adjustBrightness(todayColor, -15)})`,
        }}
      >
        {/* 유리 효과 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        
        <div className="relative z-10">
          <p className="text-white/90 mb-2">이번 주 걸음 기록</p>
          <h2 className="mb-4 text-white">총 {totalSteps.toLocaleString()}보!</h2>
          <p className="text-white/80">
            평균 {avgSteps.toLocaleString()}걸음을 걸었어요<br/>
            계속해서 색을 모아보세요!
          </p>
        </div>
      </motion.div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <TrendingUp className="w-8 h-8 text-blue-500 mb-3" />
          <p className="text-gray-500 mb-1">평균 걸음</p>
          <p className="text-2xl text-gray-800">{avgSteps.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">걸음/일</p>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <Palette className="w-8 h-8 text-purple-500 mb-3" />
          <p className="text-gray-500 mb-1">수집 색상</p>
          <p className="text-2xl text-gray-800">{totalColors}</p>
          <p className="text-xs text-gray-400 mt-1">개</p>
        </motion.div>
      </div>

      {/* 주간 구슬 타임라인 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl p-6 shadow-sm"
      >
        <h3 className="mb-4">주간 타임라인</h3>
        <div className="space-y-4">
          {recentMarbles.map((marble, index) => {
            const mainColor = marble.colors.length > 0 ? marble.colors[0] : '#e5e7eb';
            
            return (
              <div key={marble.date} className="flex items-center gap-4">
                <div className="text-sm text-gray-500 w-20">
                  {new Date(marble.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </div>
                
                {/* 예쁜 bubble 구슬 */}
                <div
                  className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))', isolation: 'isolate' }}
                >
                  {/* (A) 색 레이어 */}
                  {(marble.colors.length === 1
                    ? getSingleBlobStyles(marble.colors[0])
                    : marble.colors.length > 0
                    ? getBlobStyles(marble.colors)
                    : [{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '9999px',
                        background: 'radial-gradient(circle at 50% 45%, rgba(243,244,246,0.95), rgba(229,231,235,0.90), rgba(209,213,219,0))'
                      } as React.CSSProperties]
                  ).map((style, idx) => (
                    <div key={idx} style={style} />
                  ))}

                  {/* (B) 내부 광원 */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      mixBlendMode: 'screen',
                      background: `
                        radial-gradient(circle at 40% 35%,
                          rgba(255,255,255,0.5) 0%,
                          rgba(255,255,255,0.2) 30%,
                          rgba(255,255,255,0) 65%)
                      `
                    }}
                  />

                  {/* (C) 림 라이트 */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      mixBlendMode: 'screen',
                      background: `
                        radial-gradient(circle,
                          rgba(255,255,255,0) 60%,
                          rgba(255,255,255,0.35) 80%,
                          rgba(255,255,255,0) 85%)
                      `
                    }}
                  />

                  {/* (D) 작은 하이라이트 */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      top: '24%', right: '26%', width: '18%', height: '18%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)',
                      filter: 'blur(1px)', mixBlendMode: 'screen'
                    }}
                  />

                  {/* (E) 안쪽 그림자 */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 60% 68%, rgba(0,0,0,0.06), rgba(0,0,0,0) 55%)',
                      mixBlendMode: 'multiply'
                    }}
                  />
                </div>
                
                <div className="flex-1">
                  <p className="text-gray-700">{marble.steps.toLocaleString()}걸음</p>
                  <p className="text-xs text-gray-400">{marble.distance}km · {marble.colors.length}색</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
