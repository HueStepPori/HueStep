import { Footprints, Sparkles, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { adjustBrightness } from '../utils/colorUtils';

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

      {/* 메인 컬러 bubble - 더 예쁘고 입체적인 효과 */}
      <div className="relative w-56 h-56 mb-8">
        {/* 메인 구슬 */}
        <div 
          className="w-full h-full rounded-full relative overflow-hidden"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${adjustBrightness(color, 40)}, ${color} 45%, ${adjustBrightness(color, -20)} 100%)`,
            boxShadow: `
              0 10px 40px ${color}40,
              inset -10px -10px 30px ${adjustBrightness(color, -30)}40,
              inset 10px 10px 30px ${adjustBrightness(color, 50)}60
            `,
          }}
        >
          {/* 유리 반사 - 좌상단 큰 하이라이트 */}
          <div className="absolute top-[8%] left-[18%] w-[45%] h-[45%] rounded-full bg-white/50 blur-2xl" />
          
          {/* 보조 하이라이트 */}
          <div className="absolute top-[15%] left-[25%] w-[30%] h-[30%] rounded-full bg-white/70 blur-xl" />
          
          {/* 작은 반짝임들 */}
          <div className="absolute top-[20%] right-[22%] w-6 h-6 rounded-full bg-white/90 blur-sm" />
          <div className="absolute top-[28%] right-[28%] w-3 h-3 rounded-full bg-white" />
          <div className="absolute top-[25%] left-[68%] w-2 h-2 rounded-full bg-white/80" />
          
          {/* 측면 광택 */}
          <div className="absolute top-1/2 -translate-y-1/2 right-[8%] w-[10%] h-[35%] rounded-full bg-white/15 blur-lg rotate-12" />
          
          {/* 하단 그림자 영역 */}
          <div 
            className="absolute bottom-0 inset-x-0 h-2/5 rounded-full"
            style={{
              background: `radial-gradient(ellipse at 50% 120%, ${adjustBrightness(color, -40)}60 0%, transparent 70%)`
            }}
          />
        </div>
        
        {/* 바닥 그림자 */}
        <div 
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-10 rounded-full blur-2xl opacity-30"
          style={{ backgroundColor: color }}
        />
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
