import { useState, useRef } from 'react';
import { Download, Share2, X, Edit2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import html2canvas from 'html2canvas';

interface PaletteShareProps {
  colors: Array<{ color: string; imageUrl: string }>;
  date: string;
  onClose: () => void;
}

export function PaletteShare({ colors, date, onClose }: PaletteShareProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [colorName, setColorName] = useState('My Color');
  const [isEditingName, setIsEditingName] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  const selectedColor = colors[selectedImageIndex];

  const handleDownload = async () => {
    if (!paletteRef.current) return;

    try {
      const canvas = await html2canvas(paletteRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `palette-${date}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  const handleShare = async () => {
    if (!paletteRef.current) return;

    try {
      const canvas = await html2canvas(paletteRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `palette-${date}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Color Palette',
            text: `${colorName} - ${date}`,
          });
        } else {
          // 공유 API를 사용할 수 없으면 다운로드
          handleDownload();
        }
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3>팔레트 공유</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* 대표 사진 선택 */}
          <div className="mb-6">
            <p className="text-gray-500 mb-3">대표 사진 선택</p>
            <div className="grid grid-cols-3 gap-3">
              {colors.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-2xl overflow-hidden transition-all ${
                    selectedImageIndex === index
                      ? 'ring-4 ring-blue-500 scale-105'
                      : 'ring-2 ring-gray-200 hover:ring-gray-300'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={`Color ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 팔레트 미리보기 */}
          <div className="mb-6">
            <p className="text-gray-500 mb-3">미리보기</p>
            
            <div ref={paletteRef} className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* 배경 이미지 */}
              <img
                src={selectedColor.imageUrl}
                alt="Background"
                className="w-full aspect-[3/4] object-cover"
              />

              {/* 오버레이 그라데이션 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* 컬러 카드 */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%]">
                <div 
                  className="rounded-2xl overflow-hidden shadow-2xl"
                  style={{ backgroundColor: selectedColor.color }}
                >
                  {/* 색상 영역 */}
                  <div className="aspect-[4/3] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                  </div>

                  {/* 정보 영역 */}
                  <div className="bg-white px-6 py-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        {isEditingName ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={colorName}
                              onChange={(e) => setColorName(e.target.value)}
                              className="h-8"
                              autoFocus
                            />
                            <button
                              onClick={() => setIsEditingName(false)}
                              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="text-gray-900">{colorName}</h3>
                            <button
                              onClick={() => setIsEditingName(true)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Hex: {selectedColor.color}</p>
                      <p className="text-xs text-gray-400">{date}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              저장
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              공유
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
