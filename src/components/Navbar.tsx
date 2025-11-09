import { Home, Camera, Calendar, BarChart3 } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'walk' | 'calendar' | 'report';
  onNavigate: (view: 'home' | 'walk' | 'calendar' | 'report') => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const navItems = [
    { id: 'home' as const, icon: Home, label: '홈' },
    { id: 'walk' as const, icon: Camera, label: '워크' },
    { id: 'calendar' as const, icon: Calendar, label: '캘린더' },
    { id: 'report' as const, icon: BarChart3, label: '리포트' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map(({ id, icon: Icon, label }) => {
            const isActive = currentView === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#9BCBF7]/10 to-[#A8E6CF]/10' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 ${
                    isActive 
                      ? 'text-[#9BCBF7]' 
                      : 'text-gray-400'
                  }`}
                />
                <span 
                  className={`text-xs ${
                    isActive 
                      ? 'text-[#9BCBF7]' 
                      : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
