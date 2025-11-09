import { useRef, useState } from 'react';
import { Camera, Plus, X, Droplet } from 'lucide-react';
import { Button } from './ui/button';
import { isSimilarColor } from '../utils/colorUtils';
import { toast } from 'sonner';

interface ColorWalkProps {
  todayColor: string;
  todayColorName: string;
  collectedColors: Array<{ color: string; imageUrl: string }>;
  onColorCollected: (color: string, imageUrl: string) => void;
  onFinish: () => void;
}

export function ColorWalk({ todayColor, todayColorName, collectedColors, onColorCollected, onFinish }: ColorWalkProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setPreview(event.target?.result as string);
          setIsPickingColor(true);
          setPickedColor(null);
          
          // 숨겨진 캔버스에 원본 이미지 그리기
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
            }
          }

          // 미리보기 캔버스에도 그리기
          const previewCanvas = previewCanvasRef.current;
          if (previewCanvas) {
            const ctx = previewCanvas.getContext('2d');
            if (ctx) {
              const maxWidth = 800;
              const maxHeight = 600;
              let width = img.width;
              let height = img.height;

              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = width * ratio;
                height = height * ratio;
              }

              previewCanvas.width = width;
              previewCanvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingColor) return;

    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = previewCanvas.getBoundingClientRect();
    const scaleX = canvas.width / previewCanvas.width;
    const scaleY = canvas.height / previewCanvas.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
    
    setPickedColor(hex);
    setIsPickingColor(false);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingColor) return;

    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    const rect = previewCanvas.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleSaveColor = () => {
    if (!pickedColor || !preview) return;

    // 색상 유사도 검증
    if (!isSimilarColor(todayColor, pickedColor)) {
      toast.error('오늘의 컬러와 비슷한 계열의 색을 선택해주세요!', {
        description: `오늘의 색: ${todayColorName}`,
      });
      return;
    }

    onColorCollected(pickedColor, preview);
    setPreview(null);
    setPickedColor(null);
    setIsPickingColor(false);
    setCursorPosition(null);
  };

  const handleCancel = () => {
    setPreview(null);
    setPickedColor(null);
    setIsPickingColor(false);
    setCursorPosition(null);
  };

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="text-center mb-8">
        <h2 className="mb-2">컬러 워크</h2>
        <p className="text-gray-500">주변에서 색을 찾아 사진을 찍어보세요</p>
      </div>

      {/* 오늘의 목표 색상 */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <p className="text-gray-500 mb-3">오늘의 목표 색상</p>
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <div 
              className="w-full h-full rounded-full shadow-md"
              style={{ backgroundColor: todayColor }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
            </div>
          </div>
          <span>{todayColorName}</span>
        </div>
      </div>

      {/* 수집된 색상들 */}
      {collectedColors.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <p className="text-gray-500 mb-3">수집한 색상 ({collectedColors.length})</p>
          <div className="grid grid-cols-3 gap-3">
            {collectedColors.map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div 
                  className="w-full aspect-square rounded-2xl shadow-md relative overflow-hidden"
                  style={{ 
                    backgroundImage: `url(${item.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div 
                    className="absolute bottom-0 inset-x-0 h-8 flex items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="text-xs text-white drop-shadow-md">{item.color}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 사진 촬영/업로드 영역 */}
      {!preview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 hover:border-gray-300 transition-colors"
        >
          <Camera className="w-16 h-16 text-gray-300" />
          <div className="text-center">
            <p className="text-gray-600 mb-1">사진 추가하기</p>
            <p className="text-gray-400">스포이드로 원하는 색상을 선택하세요</p>
          </div>
        </button>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="relative mb-4">
            <canvas
              ref={previewCanvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setCursorPosition(null)}
              className={`w-full max-h-96 rounded-2xl ${isPickingColor ? 'cursor-crosshair' : ''}`}
              style={{ display: 'block' }}
            />
            
            {isPickingColor && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Droplet className="w-4 h-4 text-blue-500" />
                <span className="text-sm">색상을 클릭하세요</span>
              </div>
            )}

            {/* 스포이드 커서 미리보기 */}
            {isPickingColor && cursorPosition && (
              <div 
                className="absolute w-8 h-8 border-2 border-white rounded-full pointer-events-none shadow-lg"
                style={{
                  left: cursorPosition.x - 16,
                  top: cursorPosition.y - 16,
                }}
              />
            )}
          </div>
          
          {pickedColor && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-2xl">
              <div className="relative w-16 h-16 flex-shrink-0">
                <div 
                  className="w-full h-full rounded-full shadow-lg"
                  style={{ backgroundColor: pickedColor }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-500">선택된 색상</p>
                <p className="text-gray-700">{pickedColor}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            
            {!isPickingColor && !pickedColor && (
              <Button 
                onClick={() => setIsPickingColor(true)}
                className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
              >
                <Droplet className="w-4 h-4 mr-2" />
                다시 선택
              </Button>
            )}
            
            {pickedColor && (
              <Button 
                onClick={handleSaveColor}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                색상 저장
              </Button>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* 워크 종료 버튼 */}
      {collectedColors.length > 0 && (
        <Button 
          onClick={onFinish}
          className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6 rounded-full"
        >
          워크 종료하고 구슬 만들기
        </Button>
      )}
    </div>
  );
}
