import { motion } from 'motion/react';
import { Footprints, MapPin, Palette } from 'lucide-react';
import { Button } from './ui/button';

interface MarbleViewProps {
  colors: string[];
  steps: number;
  distance: number;
  date: string;
  onContinue: () => void;
  onShare: () => void;
}

export function MarbleView({ colors, steps, distance, date, onContinue, onShare }: MarbleViewProps) {
  // 구슬 그라데이션 생성
  const marbleGradient = colors.length > 0 
    ? `linear-gradient(135deg, ${colors.join(', ')})`
    : 'linear-gradient(135deg, #9BCBF7, #A8E6CF, #CBAACB)';

  // 걸음 수에 따른 구슬 크기
  const marbleSize = Math.min(280, 200 + (steps / 10000) * 80);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-8"
      >
        <h2 className="mb-2">오늘의 유리구슬이 완성되었어요!</h2>
        <p className="text-gray-500">{date}</p>
      </motion.div>

      {/* 반짝이는 유리구슬 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.3, 
          duration: 1, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
        className="relative mb-12"
        style={{ width: marbleSize, height: marbleSize }}
      >
        <div 
          className="w-full h-full rounded-full shadow-2xl relative overflow-hidden"
          style={{ background: marbleGradient }}
        >
          {/* 유리 반사 효과 - 강화 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent rounded-full" />
          
          {/* 메인 하이라이트 - 좌상단 */}
          <div className="absolute top-[12%] left-[22%] w-[38%] h-[38%] bg-white/50 rounded-full blur-2xl" />
          
          {/* 보조 하이라이트 */}
          <div className="absolute top-[18%] left-[28%] w-[25%] h-[25%] bg-white/60 rounded-full blur-xl" />
          
          {/* 반짝임 효과들 */}
          <motion.div
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-[22%] right-[24%] w-5 h-5 bg-white/80 rounded-full blur-sm"
          />
          
          <motion.div
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute top-[32%] right-[30%] w-3 h-3 bg-white/90 rounded-full"
          />
          
          <div className="absolute top-[28%] left-[65%] w-2 h-2 bg-white/70 rounded-full" />
          
          {/* 측면 반사광 */}
          <div className="absolute top-1/2 -translate-y-1/2 right-[10%] w-[8%] h-[30%] bg-white/20 rounded-full blur-lg" />
          
          {/* 하단 그림자 */}
          <div className="absolute bottom-0 inset-x-0 h-2/5 bg-gradient-to-t from-black/15 via-black/5 to-transparent rounded-full" />
          
          {/* 전체 유리 광택 */}
          <motion.div
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full"
          />
        </div>
        
        {/* 바닥 그림자 */}
        <div 
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full blur-2xl opacity-20"
          style={{ 
            background: colors.length > 0 ? colors[0] : '#999'
          }}
        />
      </motion.div>

      {/* 통계 정보 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-lg mb-6"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Footprints className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-gray-500 mb-1">걸음 수</p>
            <p className="text-gray-800">{steps.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500 mb-1">거리</p>
            <p className="text-gray-800">{distance}km</p>
          </div>
          <div className="text-center">
            <Palette className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-gray-500 mb-1">수집 색상</p>
            <p className="text-gray-800">{colors.length}개</p>
          </div>
        </div>

        {/* 색상 팔레트 */}
        {colors.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-500 mb-3">오늘의 컬러 팔레트</p>
            <div className="flex gap-2">
              {colors.map((color, index) => (
                <div key={index} className="flex-1 text-center">
                  <div 
                    className="w-full aspect-square rounded-xl mb-2 shadow-md relative"
                    style={{ backgroundColor: color }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                  </div>
                  <p className="text-xs text-gray-400">{color}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex gap-3 w-full max-w-md">
        <Button 
          onClick={onShare}
          variant="outline"
          className="flex-1 py-6 rounded-full border-2"
        >
          팔레트 공유하기
        </Button>
        <Button 
          onClick={onContinue}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-6 rounded-full shadow-lg"
        >
          캘린더 보기
        </Button>
      </div>
    </div>
  );
}
