import { Footprints, Sparkles, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
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

interface TodayColorProps {
  color: string;
  colorName: string;
  steps: number;
  onStartWalk: () => void;
  onColorNameChange: (name: string) => void;
}

export function TodayColor({ color, colorName, steps, onStartWalk, onColorNameChange }: TodayColorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(colorName);

  const handleSaveName = () => {
    onColorNameChange(editedName);
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      <div className="flex items-center gap-2 mb-8">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <span className="text-gray-500">오늘의 컬러</span>
      </div>

      {/* 메인 컬러 bubble - 캘린더와 동일한 스타일 */}
      <div className="relative w-56 h-56 mb-8">
        <div
          className="w-full h-full rounded-full overflow-hidden relative"
          style={{ isolation: 'isolate' }}
        >
          {/* (A) 색 레이어 */}
          {getSingleBlobStyles(color).map((style, idx) => (
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

      </div>

      {/* 색상 이름 편집 */}
      {isEditingName ? (
        <div className="flex items-center gap-2 mb-8">
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-40 text-center"
            autoFocus
          />
          <Button onClick={handleSaveName} size="sm">
            저장
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-8">
          <h2>{colorName}</h2>
          <button 
            onClick={() => setIsEditingName(true)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* 걸음 수 표시 */}
      <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full mb-8">
        <Footprints className="w-5 h-5 text-gray-400" />
        <span className="text-gray-700">{steps.toLocaleString()}걸음</span>
      </div>

      <Button 
        onClick={onStartWalk}
        className="px-8 py-6 rounded-full shadow-lg text-white hover:opacity-90 transition-opacity"
        style={{
          background: `linear-gradient(135deg, ${color}, ${adjustBrightness(color, -15)})`,
        }}
      >
        컬러 워크 시작하기
      </Button>

      <p className="text-gray-400 mt-4 text-center max-w-xs">
        산책하며 {colorName}을 찾아보세요!
      </p>
    </div>
  );
}
