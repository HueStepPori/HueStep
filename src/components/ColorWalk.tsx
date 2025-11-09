import { useRef, useState, useEffect } from 'react';
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

  // preview가 변경될 때 원본 캔버스에 이미지 그리기 (색상 추출용)
  useEffect(() => {
    if (!preview || !imageRef.current) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    
    if (canvas && img.complete) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
    }
  }, [preview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          const imageUrl = event.target?.result as string;
          setPreview(imageUrl);
          setIsPickingColor(true);
          setPickedColor(null);
          
          // 숨겨진 캔버스에 원본 이미지 그리기
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              // 캔버스 초기화
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
            }
          }

          // 미리보기 캔버스 설정 (투명한 오버레이로 클릭 감지용)
          const previewCanvas = previewCanvasRef.current;
          if (previewCanvas) {
            // 이미지의 표시 크기에 맞춰 캔버스 크기 설정
            const maxWidth = 800;
            const maxHeight = 600;
            let displayWidth = img.width;
            let displayHeight = img.height;

            if (displayWidth > maxWidth || displayHeight > maxHeight) {
              const ratio = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
              displayWidth = displayWidth * ratio;
              displayHeight = displayHeight * ratio;
            }

            previewCanvas.width = displayWidth;
            previewCanvas.height = displayHeight;
          }
        };
        img.onerror = () => {
          toast.error('이미지를 불러올 수 없습니다.');
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        toast.error('파일을 읽을 수 없습니다.');
      };
      reader.readAsDataURL(file);
    }
    // 같은 파일을 다시 선택할 수 있도록 input 초기화
    e.target.value = '';
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingColor) return;

    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = imageRef.current;
    
    // img 태그의 실제 표시 크기 계산
    const imgElement = previewCanvas.parentElement?.querySelector('img');
    if (!imgElement) return;
    
    const imgRect = imgElement.getBoundingClientRect();
    const imgDisplayWidth = imgRect.width;
    const imgDisplayHeight = imgRect.height;
    
    // 클릭 좌표를 img 태그 기준으로 변환
    const clickX = e.clientX - imgRect.left;
    const clickY = e.clientY - imgRect.top;
    
    // 클릭한 위치를 원본 이미지 좌표로 변환
    const x = Math.floor((clickX / imgDisplayWidth) * img.width);
    const y = Math.floor((clickY / imgDisplayHeight) * img.height);
    
    // 좌표 범위 검증
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      return;
    }

    try {
      const imageData = ctx.getImageData(x, y, 1, 1);
      const pixel = imageData.data;
      
      // RGBA 값 추출
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      
      // 16진수로 변환 (항상 2자리로 패딩)
      const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
      
      setPickedColor(hex);
      setIsPickingColor(false);
    } catch (error) {
      console.error('색상 추출 오류:', error);
      toast.error('색상을 추출할 수 없습니다.');
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingColor) return;

    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    // img 태그의 실제 위치를 기준으로 커서 위치 계산
    const imgElement = previewCanvas.parentElement?.querySelector('img');
    if (!imgElement) return;

    const imgRect = imgElement.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - imgRect.left,
      y: e.clientY - imgRect.top,
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
            <div className="relative w-full flex justify-center items-center bg-gray-50 rounded-2xl overflow-hidden min-h-[200px]">
              {preview && (
                <>
                  <img
                    src={preview}
                    alt="Uploaded"
                    className="max-w-full max-h-96 rounded-2xl"
                    style={{ 
                      display: 'block',
                      width: '100%',
                      height: 'auto',
                      maxHeight: '600px',
                      objectFit: 'contain'
                    }}
                  />
                  <canvas
                    ref={previewCanvasRef}
                    onClick={handleCanvasClick}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={() => setCursorPosition(null)}
                    className={`absolute inset-0 w-full h-full ${isPickingColor ? 'cursor-crosshair' : 'cursor-pointer'}`}
                    style={{ 
                      pointerEvents: 'auto',
                      opacity: 0
                    }}
                  />
                </>
              )}
            </div>
            
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
