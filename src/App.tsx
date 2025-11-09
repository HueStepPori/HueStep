import { useState, useEffect } from 'react';
import { TodayColor } from './components/TodayColor';
import { ColorWalk } from './components/ColorWalk';
import { MarbleView } from './components/MarbleView';
import { ColorCalendar } from './components/ColorCalendar';
import { WeeklyReport } from './components/WeeklyReport';
import { PaletteShare } from './components/PaletteShare';
import { Navbar } from './components/Navbar';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { isSimilarColor } from './utils/colorUtils';
import { getRecommendedColor, allColors } from './utils/weatherColorRecommendation';

interface DayMarble {
  date: string;
  colors: string[];
  steps: number;
  distance: number;
}

interface CollectedColor {
  color: string;
  imageUrl: string;
}

type View = 'home' | 'walk' | 'calendar' | 'report' | 'marble' | 'share';

// 샘플 데이터 생성 - 비슷한 계열 색상만
const generateSampleMarbles = (): DayMarble[] => {
  const marbles: DayMarble[] = [];
  const today = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 하나의 기준 색상 선택
    const baseColor = allColors[Math.floor(Math.random() * allColors.length)];
    
    // 비슷한 계열의 색상만 수집
    const similarColors = allColors.filter(c => 
      isSimilarColor(baseColor.color, c.color)
    );
    
    const numColors = Math.min(Math.floor(Math.random() * 3) + 1, similarColors.length);
    const colors = Array.from({ length: numColors }, (_, idx) => 
      similarColors[idx % similarColors.length].color
    );
    
    marbles.push({
      date: dateStr,
      colors,
      steps: Math.floor(Math.random() * 8000) + 2000,
      distance: +(Math.random() * 5 + 1).toFixed(1),
    });
  }
  
  return marbles;
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [todayColor, setTodayColor] = useState(allColors[0]);
  const [todayColorName, setTodayColorName] = useState(allColors[0].desc);
  const [currentSteps, setCurrentSteps] = useState(5230);
  const [collectedColors, setCollectedColors] = useState<CollectedColor[]>([]);
  const [marbles, setMarbles] = useState<DayMarble[]>(generateSampleMarbles());
  const [walkStarted, setWalkStarted] = useState(false);

  // 오늘의 색상 추천 - 계절/날씨/시간 기반
  useEffect(() => {
    const recommendedColor = getRecommendedColor();
    setTodayColor(recommendedColor);
    setTodayColorName(recommendedColor.desc);
  }, []);

  // 걸음 수 시뮬레이션
  useEffect(() => {
    if (walkStarted && currentView === 'walk') {
      const interval = setInterval(() => {
        setCurrentSteps(prev => prev + Math.floor(Math.random() * 15) + 5);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [walkStarted, currentView]);

  const handleStartWalk = () => {
    setWalkStarted(true);
    setCurrentView('walk');
    toast.success('컬러 워크를 시작합니다!');
  };

  const handleColorNameChange = (name: string) => {
    setTodayColorName(name);
  };

  const handleColorCollected = (color: string, imageUrl: string) => {
    setCollectedColors(prev => [...prev, { color, imageUrl }]);
    toast.success('색상이 추가되었습니다!', {
      description: color,
    });
  };

  const handleColorDeleted = (index: number) => {
    const deletedColor = collectedColors[index];
    setCollectedColors(prev => prev.filter((_, i) => i !== index));
    toast.success('색상이 삭제되었습니다!', {
      description: deletedColor.color,
    });
  };

  const handleFinishWalk = () => {
    const today = new Date().toISOString().split('T')[0];
    const newMarble: DayMarble = {
      date: today,
      colors: collectedColors.map(c => c.color),
      steps: currentSteps,
      distance: +(currentSteps * 0.0007).toFixed(1),
    };

    // 기존 오늘 데이터가 있으면 업데이트, 없으면 추가
    setMarbles(prev => {
      const filtered = prev.filter(m => m.date !== today);
      return [...filtered, newMarble];
    });

    setCurrentView('marble');
  };

  const handleContinueFromMarble = () => {
    setCurrentView('calendar');
  };

  const handleSharePalette = () => {
    setCurrentView('share');
  };

  const handleCloseShare = () => {
    setCurrentView('marble');
  };

  const handleResetWalk = () => {
    setCollectedColors([]);
    setWalkStarted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <Toaster />
      
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
            <h1 className="text-gray-800">HueColor</h1>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main>
        {currentView === 'home' && (
          <TodayColor
            color={todayColor.color}
            colorName={todayColorName}
            steps={currentSteps}
            onStartWalk={handleStartWalk}
            onColorNameChange={handleColorNameChange}
          />
        )}

        {currentView === 'walk' && (
          <ColorWalk
            todayColor={todayColor.color}
            todayColorName={todayColorName}
            collectedColors={collectedColors}
            onColorCollected={handleColorCollected}
            onColorDeleted={handleColorDeleted}
            onFinish={handleFinishWalk}
          />
        )}

        {currentView === 'marble' && (
          <MarbleView
            colors={collectedColors.map(c => c.color)}
            steps={currentSteps}
            distance={+(currentSteps * 0.0007).toFixed(1)}
            date={new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            onContinue={handleContinueFromMarble}
            onShare={handleSharePalette}
          />
        )}

        {currentView === 'calendar' && (
          <ColorCalendar marbles={marbles} />
        )}

        {currentView === 'report' && (
          <WeeklyReport marbles={marbles} todayColor={todayColor.color} />
        )}
      </main>

      {/* 팔레트 공유 모달 */}
      {currentView === 'share' && collectedColors.length > 0 && (
        <PaletteShare
          colors={collectedColors}
          date={new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
          onClose={handleCloseShare}
        />
      )}

      {/* 하단 네비게이션 */}
      {currentView !== 'marble' && currentView !== 'share' && (
        <Navbar 
          currentView={currentView}
          onNavigate={setCurrentView}
        />
      )}
    </div>
  );
}
