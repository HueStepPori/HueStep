import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
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

  // (1) 중심 코어: 구슬이 '잘려 보이지 않도록' 중앙에서 강한 채움
  styles.push({
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    // mixBlendMode 없이 일반 합성으로 꽉 채우기
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

// ✅ 다색용(기존): 필요 시 살짝 중심 보강(아주 옅은 중앙 채움으로 경계 부드럽게)
const getBlobStyles = (colors: string[]) => {
  if (!colors?.length) return [];

  const LAYERS_PER_COLOR = 2;
  const radius = 42;
  const spread = 10;
  const sizePct = 58;
  const alphaCenter = 0.65;

  const styles: React.CSSProperties[] = [];

  // 중앙 아주 약한 보강(다색 섞일 때도 중심이 비지 않도록)
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

interface ColorCalendarProps {
  marbles: DayMarble[];
}

export function ColorCalendar({ marbles }: ColorCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayMarble | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const getMarbleForDate = (day: number): DayMarble | undefined => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return marbles.find(m => m.date === dateStr);
  };

  const getDateString = (day: number): string => {
    return `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getTodayString = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const handleDayClick = (day: number) => {
    const marble = getMarbleForDate(day);
    const dateStr = getDateString(day);
    
    if (marble) {
      setSelectedDay(marble);
      setSelectedDate(dateStr);
    }
  };

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const todayStr = getTodayString();

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="mb-2">컬러 캘린더</h2>
        <p className="text-gray-500">당신의 걸음이 색으로 기록됩니다</p>
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3>
          {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* 캘린더 그리드 */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-2">
          {/* 빈 칸 */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* 날짜 */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const marble = getMarbleForDate(day);
            const dateStr = getDateString(day);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square rounded-2xl relative transition-all ${
                  isSelected 
                    ? 'ring-4 ring-blue-400' 
                    : isToday 
                    ? 'ring-2 ring-gray-300' 
                    : ''
                }`}
              >
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs text-gray-500 z-10">
                  {day}
                </div>
                
                {marble && marble.colors.length > 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <div
                      className="w-2/3 md:w-3/4 aspect-square rounded-full overflow-hidden"
                      style={{ isolation: 'isolate' }}
                    >
                      {/* (A) 색 레이어 */}
                      {(marble.colors.length === 1
                        ? getSingleBlobStyles(marble.colors[0])   // ✅ 단일 색 → 중앙 코어 방식
                        : getBlobStyles(marble.colors)            // ✅ 다색 → 기존 분산 방울 방식
                      ).map((style, idx) => (
                        <div key={idx} style={style} />
                      ))}

                      {/* (B) 내부 광원(발광감) */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          mixBlendMode: 'screen',
                          background: `
                            radial-gradient(circle at 40% 35%,
                              rgba(255,255,255,0.55) 0%,
                              rgba(255,255,255,0.22) 30%,
                              rgba(255,255,255,0.10) 50%,
                              rgba(255,255,255,0) 72%)
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
                              rgba(255,255,255,0.38) 83%,
                              rgba(255,255,255,0) 86%)
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

                      {/* (E) 안쪽 그림자(깊이) */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(circle at 60% 68%, rgba(0,0,0,0.07), rgba(0,0,0,0) 55%)',
                          mixBlendMode: 'multiply'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 top-5 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 aspect-square rounded-full bg-gray-50" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜 상세 정보 */}
      {selectedDay && (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="mb-4">{selectedDay.date}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-500 mb-1">걸음 수</p>
              <p className="text-gray-800">{selectedDay.steps.toLocaleString()}걸음</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">이동 거리</p>
              <p className="text-gray-800">{selectedDay.distance}km</p>
            </div>
          </div>

          {selectedDay.colors.length > 0 && (
            <div>
              <p className="text-gray-500 mb-3">수집한 색상</p>
              <div className="flex gap-2">
                {selectedDay.colors.map((color, index) => (
                  <div key={index} className="flex-1 text-center">
                    <div
                      className="w-full aspect-square rounded-xl mb-2"
                      style={{
                        backgroundColor: color
                      }}
                    />
                    <p className="text-xs text-gray-400">{color}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => {
              setSelectedDay(null);
              setSelectedDate(null);
            }}
            variant="outline"
            className="w-full mt-6"
          >
            닫기
          </Button>
        </div>
      )}
    </div>
  );
}
