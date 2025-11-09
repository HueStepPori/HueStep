import { TrendingUp, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { adjustBrightness } from '../utils/colorUtils';

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
                <div className="relative w-14 h-14 flex-shrink-0">
                  <div 
                    className="w-full h-full rounded-full"
                    style={{
                      background: marble.colors.length > 0
                        ? `radial-gradient(circle at 35% 35%, ${adjustBrightness(mainColor, 40)}, ${mainColor} 50%, ${adjustBrightness(mainColor, -15)} 100%)`
                        : 'radial-gradient(circle at 35% 35%, #f3f4f6, #e5e7eb 50%, #d1d5db 100%)',
                    }}
                  >
                    {/* 유리 하이라이트 */}
                    <div className="absolute top-[15%] left-[20%] w-[45%] h-[45%] rounded-full bg-white/60 blur-lg" />
                    <div className="absolute top-[20%] left-[28%] w-[32%] h-[32%] rounded-full bg-white/80 blur-md" />
                    
                    {/* 작은 반짝임 */}
                    <div className="absolute top-[25%] right-[24%] w-[20%] h-[20%] rounded-full bg-white/75 blur-sm" />
                  </div>
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
