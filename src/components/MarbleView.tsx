import { motion } from 'motion/react';
import { Footprints, MapPin, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { adjustBrightness } from '../utils/colorUtils';

interface MarbleViewProps {
  colors: string[];
  steps: number;
  distance: number;
  date: string;
  onContinue: () => void;
  onShare: () => void;
}

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

export function MarbleView({ colors, steps, distance, date, onContinue, onShare }: MarbleViewProps) {
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

      {/* 캘린더와 동일한 스타일의 구슬 */}
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
          className="w-full h-full rounded-full overflow-hidden relative"
          style={{ isolation: 'isolate' }}
        >
          {/* (A) 색 레이어 */}
          {(colors.length === 1
            ? getSingleBlobStyles(colors[0])
            : colors.length > 0
            ? getBlobStyles(colors)
            : getBlobStyles(['#9BCBF7', '#A8E6CF', '#CBAACB'])
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
              filter: 'blur(2px)', mixBlendMode: 'screen'
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: '34%', right: '32%', width: '10%', height: '10%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)',
              filter: 'blur(1.5px)', mixBlendMode: 'screen'
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
