import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Share2, X, Edit2, Check, Move, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Slider } from "./ui/slider";

interface PaletteShareProps {
  colors: Array<{ color: string; imageUrl: string }>;
  date: string;
  onClose: () => void;
}

type Point = { x: number; y: number };

// ---- Canvas / Frame constants ------------------------------------------------
// Export will exactly match preview: we render preview in a square frame (1:1)
// and export the same layout at higher pixel density.
const PREVIEW_SIZE = 468; // CSS pixels for on-screen preview (square) - 1.3배 (360 * 1.3)
const EXPORT_SIZE = 2048; // canvas pixels for saved image (square)

export function PaletteShare({ colors, date, onClose }: PaletteShareProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [colorName, setColorName] = useState("My Color");
  const [isEditingName, setIsEditingName] = useState(false);

  // ---- Image transform state (for panning / zooming) -------------------------
  const [imgScale, setImgScale] = useState(1.0);
  const [imgOffset, setImgOffset] = useState<Point>({ x: 0, y: 0 }); // in preview px

  // ---- Palette card transform (position & scale) -----------------------------
  // position is the card center point in preview coords
  const [cardPos, setCardPos] = useState<Point>({ x: PREVIEW_SIZE / 2, y: PREVIEW_SIZE * 0.78 });
  const [cardScale, setCardScale] = useState(0.60); // 0.50 ~ 0.90 recommended (min 0.50 to prevent text cutoff)

  // drag state
  const dragRef = useRef<{ type: "image" | "card" | null; start: Point; startPos: Point; startOffset: Point } | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedColor = colors[selectedImageIndex];

  // ---- Derived sizes from state (single source of truth) ---------------------
  const frame = useMemo(() => ({ w: PREVIEW_SIZE, h: PREVIEW_SIZE }), []);

  // Card base dimensions before scaling
  const baseCardW = frame.w * 0.70;
  const baseCardH = baseCardW; // 정사각형
  const cardW = baseCardW * cardScale;
  const cardH = baseCardH * cardScale;

  // Image natural fit (cover) helper: we emulate CSS object-cover in canvas
  const getCoverDrawRect = (img: HTMLImageElement, targetW: number, targetH: number) => {
    const rImg = img.width / img.height;
    const rTar = targetW / targetH;
    let drawW: number, drawH: number;
    if (rImg > rTar) {
      // image wider than target
      drawH = targetH * imgScale;
      drawW = drawH * rImg;
    } else {
      // image taller than target
      drawW = targetW * imgScale;
      drawH = drawW / rImg;
    }
    // center then offset by imgOffset (preview px)
    const x = targetW / 2 - drawW / 2 + imgOffset.x;
    const y = targetH / 2 - drawH / 2 + imgOffset.y;
    return { x, y, w: drawW, h: drawH };
  };

  // ---- Mouse interactions ----------------------------------------------------
  const onPointerDown = (e: React.PointerEvent) => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Is inside card? (rounded rect hit test approximated by bbox)
    const cx1 = cardPos.x - cardW / 2;
    const cy1 = cardPos.y - cardH / 2;
    const cx2 = cx1 + cardW;
    const cy2 = cy1 + cardH;

    const insideCard = px >= cx1 && px <= cx2 && py >= cy1 && py <= cy2;
    if (insideCard) {
      dragRef.current = { type: "card", start: { x: px, y: py }, startPos: { ...cardPos }, startOffset: { ...imgOffset } };
    } else {
      dragRef.current = { type: "image", start: { x: px, y: py }, startPos: { ...cardPos }, startOffset: { ...imgOffset } };
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const dx = px - dragRef.current.start.x;
    const dy = py - dragRef.current.start.y;

    if (dragRef.current.type === "card") {
      setCardPos({ x: dragRef.current.startPos.x + dx, y: dragRef.current.startPos.y + dy });
    } else if (dragRef.current.type === "image") {
      setImgOffset({ x: dragRef.current.startOffset.x + dx, y: dragRef.current.startOffset.y + dy });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onWheel = (e: React.WheelEvent) => {
    // zoom towards cursor for background image
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.05 : 0.95;
    const next = Math.min(4, Math.max(0.5, imgScale * factor));
    setImgScale(next);
  };

  const clampCardInside = () => {
    // keep at least 12px margin inside the frame
    const m = 12;
    setCardPos((p) => ({
      x: Math.min(frame.w - m - cardW / 2, Math.max(m + cardW / 2, p.x)),
      y: Math.min(frame.h - m - cardH / 2, Math.max(m + cardH / 2, p.y)),
    }));
  };

  useEffect(() => {
    clampCardInside();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardW, cardH, frame.w, frame.h]);

  // ---- Drawing (Preview + Export share the same renderer) --------------------
  const drawToCanvas = async (canvas: HTMLCanvasElement, pixelSize: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // scale factor from preview coords to canvas pixels
    const s = pixelSize / PREVIEW_SIZE;
    canvas.width = pixelSize;
    canvas.height = pixelSize;

    // load image
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = selectedColor.imageUrl;
    });

    // background (object-cover with transforms)
    const cover = getCoverDrawRect(img, PREVIEW_SIZE, PREVIEW_SIZE);
    ctx.drawImage(img, cover.x * s, cover.y * s, cover.w * s, cover.h * s);

    // gradient overlay (top->bottom similar to preview)
    const grd = ctx.createLinearGradient(0, 0, 0, pixelSize);
    grd.addColorStop(0.0, "rgba(0,0,0,0.0)");
    grd.addColorStop(0.3, "rgba(0,0,0,0.20)");
    grd.addColorStop(1.0, "rgba(0,0,0,0.60)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, pixelSize, pixelSize);

    // card rounded rect (square)
    const x = (cardPos.x - cardW / 2) * s;
    const y = (cardPos.y - cardH / 2) * s;
    const w = cardW * s;
    const h = cardH * s;
    const r = 20 * cardScale * s;

    // upper colored half (with top rounded corners, bottom square)
    ctx.fillStyle = selectedColor.color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x, y + h / 2);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();

    // lower white half (with bottom rounded corners, top square)
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.closePath();
    ctx.fill();

    // subtle sheen on color area
    const sheen = ctx.createLinearGradient(x, y, x + w, y + h * 0.55);
    sheen.addColorStop(0, "rgba(255,255,255,0.08)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.00)");
    sheen.addColorStop(1, "rgba(0,0,0,0.08)");
    ctx.fillStyle = sheen;
    ctx.fillRect(x, y, w, h * 0.55);

    // text (sizes scale with card) - 이름이 가장 크게, Hex, 날짜 순
    const textScaleFactor = cardScale;

    // 컬러 이름 (가장 크게)
    ctx.fillStyle = "#1f2937";
    ctx.font = `bold ${Math.round(24 * textScaleFactor * s)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(truncate(colorName, 16), x + 16 * s, y + h * 0.55 + 24 * s);

    // Hex 값 (중간)
    ctx.fillStyle = "#4b5563";
    ctx.font = `${Math.round(16 * textScaleFactor * s)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillText(`Hex: ${selectedColor.color}`, x + 16 * s, y + h * 0.55 + 42 * s);

    // 날짜 (가장 작게)
    ctx.fillStyle = "#9ca3af";
    ctx.font = `${Math.round(13 * textScaleFactor * s)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillText(date, x + 16 * s, y + h * 0.55 + 56 * s);

    return canvas;
  };

  const generateBlob = async () => {
    const canvas = canvasRef.current || document.createElement("canvas");
    const drawn = await drawToCanvas(canvas, EXPORT_SIZE);
    if (!drawn) return null;
    return await new Promise<Blob | null>((res) => drawn.toBlob((b) => res(b), "image/png", 0.95));
  };

  const handleDownload = async () => {
    try {
      const blob = await generateBlob();
      if (!blob) return toast.error("이미지 생성에 실패했습니다.");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `palette-${date}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("팔레트가 저장되었습니다!");
    } catch (e) {
      console.error(e);
      toast.error("저장에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    try {
      const blob = await generateBlob();
      if (!blob) return toast.error("이미지 생성에 실패했습니다.");
      const file = new File([blob], `palette-${date}.png`, { type: "image/png" });
      if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: "My Color Palette", text: `${colorName} - ${date}` });
        toast.success("공유되었습니다!");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `palette-${date}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("팔레트가 저장되었습니다!");
      }
    } catch (e) {
      console.error(e);
      toast.error("공유에 실패했습니다.");
    }
  };

  const resetTransforms = () => {
    setImgScale(1);
    setImgOffset({ x: 0, y: 0 });
    setCardScale(0.60);
    setCardPos({ x: PREVIEW_SIZE / 2, y: PREVIEW_SIZE * 0.78 });
  };

  // ---- Helpers ---------------------------------------------------------------
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function roundRectPartial(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: [number, number, number, number]
  ) {
    const [r1, r2, r3, r4] = r;
    ctx.beginPath();
    ctx.moveTo(x + r1, y);
    ctx.lineTo(x + w - r2, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r2);
    ctx.lineTo(x + w, y + h - r3);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r3, y + h);
    ctx.lineTo(x + r4, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r4);
    ctx.lineTo(x, y + r1);
    ctx.quadraticCurveTo(x, y, x + r1, y);
    ctx.closePath();
  }
  const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  // ---- UI --------------------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-base font-semibold">팔레트 공유</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 대표 사진 선택 */}
          <section>
            <p className="text-gray-500 mb-3 text-sm">대표 사진 선택</p>
            <div className="flex gap-2 flex-wrap overflow-x-auto max-h-20 overflow-y-auto pb-1">
              {colors.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-14 h-14 rounded-lg overflow-hidden transition-all flex-shrink-0 ${
                    selectedImageIndex === index
                      ? "ring-3 ring-purple-500 scale-105"
                      : "ring-2 ring-gray-200 hover:ring-gray-300"
                  }`}
                >
                  <img src={item.imageUrl} alt={`Color ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </section>

          {/* 미리보기 (정사각형, 드래그로 이미지/카드 이동, 휠로 줌) */}
          <section className="mt-4">
            <p className="text-gray-500 mb-5">미리보기</p>

            <div className="flex flex-col gap-4">
              <div
                ref={frameRef}
                className="relative rounded-2xl overflow-hidden shadow-2xl mx-auto"
                style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onWheel={onWheel}
              >
                {/* background image with transforms (CSS only for preview; canvas uses same math) */}
                <img
                  src={selectedColor.imageUrl}
                  alt="Background"
                  draggable={false}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: PREVIEW_SIZE,
                    height: PREVIEW_SIZE,
                    objectFit: "cover",
                    transform: `translate(${imgOffset.x}px, ${imgOffset.y}px) scale(${imgScale})`,
                    transformOrigin: "center center",
                  }}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                {/* Palette card (draggable) */}
                <div
                  className="absolute shadow-2xl cursor-grab active:cursor-grabbing flex flex-col overflow-hidden"
                  style={{
                    width: cardW,
                    height: cardH,
                    left: cardPos.x - cardW / 2,
                    top: cardPos.y - cardH / 2,
                    borderRadius: `${16 * cardScale}px`,
                  }}
                >
                  {/* color part */}
                  <div
                    className="relative bg-gradient-to-br from-white/10 via-transparent to-black/10 flex items-center justify-center"
                    style={{
                      height: cardH * 0.5,
                      backgroundColor: selectedColor.color
                    }}
                  >
                    <div className="text-white/60 flex items-center gap-1 absolute top-1.5 left-1.5" style={{ fontSize: `${Math.max(6, cardScale * 8)}px` }}>
                      <Move className="w-2 h-2" /> 드래그
                    </div>
                  </div>
                  {/* info part */}
                  <div
                    className="bg-white px-3 py-2 flex flex-col justify-between"
                    style={{
                      height: cardH * 0.5
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {isEditingName ? (
                        <div className="flex items-center gap-1 w-full">
                          <Input
                            value={colorName}
                            onChange={(e) => setColorName(e.target.value)}
                            className="flex-1 border rounded"
                            autoFocus
                            style={{ fontSize: `${Math.max(11, cardScale * 16)}px`, height: `${Math.max(24, cardScale * 28)}px` }}
                          />
                          <button onClick={() => setIsEditingName(false)} className="p-0.5 hover:bg-gray-100 rounded flex-shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <h3
                            className="font-bold text-gray-900 truncate"
                            style={{ fontSize: `${Math.max(12, cardScale * 18)}px` }}
                          >
                            {colorName}
                          </h3>
                          <button onClick={() => setIsEditingName(true)} className="p-0.5 hover:bg-gray-100 rounded flex-shrink-0">
                            <Edit2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-gray-600" style={{ fontSize: `${Math.max(9, cardScale * 13)}px` }}>
                        Hex: {selectedColor.color}
                      </p>
                      <p className="text-gray-400" style={{ fontSize: `${Math.max(8, cardScale * 11)}px` }}>
                        {date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="w-full space-y-4 text-gray-900 border-t-2 border-black pt-4">
                <Button onClick={resetTransforms} className="w-full gap-2 bg-gray-900 hover:bg-black text-black py-3 font-semibold">
                  <RefreshCw className="w-4 h-4" /> 초기화
                </Button>

                <div className="h-px bg-black"></div>

                <div className="p-4 rounded-2xl bg-gray-100 border-none">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-900">배경 이미지</div>
                    <span className="text-xs text-gray-600">{Math.round(imgScale * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="icon" variant="ghost" onClick={() => setImgScale((v) => Math.max(0.5, v * 0.95))} className="text-gray-900 hover:bg-gray-200">
                      <ZoomOut className="w-4 h-4 text-gray-800" />
                    </Button>
                    <Slider
                      value={[imgScale]}
                      min={0.5}
                      max={4}
                      step={0.01}
                      onValueChange={([v]) => setImgScale(v)}
                      className="flex-1 py-1"
                    />
                    <Button size="icon" variant="ghost" onClick={() => setImgScale((v) => Math.min(4, v * 1.05))} className="text-gray-900 hover:bg-gray-200">
                      <ZoomIn className="w-4 h-4 text-gray-800" />
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-black"></div>

                <div className="p-4 rounded-2xl bg-gray-100 border-none">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-900">팔레트 카드 크기</div>
                    <span className="text-xs text-gray-600">{Math.round(cardScale * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="icon" variant="ghost" onClick={() => setCardScale((v) => Math.max(0.35, v - 0.05))} className="text-gray-900 hover:bg-gray-200">
                      <ZoomOut className="w-4 h-4 text-gray-800" />
                    </Button>
                    <Slider
                      value={[cardScale]}
                      min={0.35}
                      max={0.9}
                      step={0.01}
                      onValueChange={([v]) => setCardScale(v)}
                      className="flex-1 py-1"
                    />
                    <Button size="icon" variant="ghost" onClick={() => setCardScale((v) => Math.min(0.9, v + 0.05))} className="text-gray-900 hover:bg-gray-200">
                      <ZoomIn className="w-4 h-4 text-gray-800" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" /> 저장
            </Button>
            <Button onClick={handleShare} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <Share2 className="w-4 h-4 mr-2" /> 공유
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for high-res export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}