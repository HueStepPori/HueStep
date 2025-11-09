import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { adjustBrightness } from '../utils/colorUtils';

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
                  <div className="absolute inset-0 top-5 flex items-center justify-center p-2">
                    <div className="relative w-3/4 h-3/4 aspect-square">
                      {/* 예쁜 bubble 구슬 - 완벽한 원형 */}
                      <div 
                        className="w-full h-full rounded-full"
                        style={{
                          background: marble.colors.length === 1
                            ? `radial-gradient(circle at 35% 35%, ${adjustBrightness(marble.colors[0], 40)}, ${marble.colors[0]} 50%, ${adjustBrightness(marble.colors[0], -15)} 100%)`
                            : `radial-gradient(circle at 35% 35%, ${marble.colors.map((c, i) => 
                                i === 0 ? adjustBrightness(c, 30) : c
                              ).join(', ')}, ${adjustBrightness(marble.colors[marble.colors.length - 1], -15)} 100%)`,
                        }}
                      >
                        {/* 유리 하이라이트 */}
                        <div className="absolute top-[15%] left-[20%] w-[45%] h-[45%] rounded-full bg-white/60 blur-md" />
                        <div className="absolute top-[20%] left-[28%] w-[30%] h-[30%] rounded-full bg-white/80 blur-sm" />
                        
                        {/* 작은 반짝임 */}
                        <div className="absolute top-[25%] right-[25%] w-[18%] h-[18%] rounded-full bg-white/70 blur-[2px]" />
                      </div>
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
                      className="w-full aspect-square rounded-xl mb-2 relative"
                      style={{ 
                        background: `radial-gradient(circle at 35% 35%, ${adjustBrightness(color, 35)}, ${color} 50%, ${adjustBrightness(color, -15)} 100%)`
                      }}
                    >
                      <div className="absolute top-[20%] left-[25%] w-[35%] h-[35%] rounded-full bg-white/50 blur-md" />
                    </div>
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
