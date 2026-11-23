import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface TracingBoardProps {
  glyph: string;
  accentColor?: string;
  onTraceProgress?: (coveragePct: number) => void;
}

export const TracingBoard: React.FC<TracingBoardProps> = ({
  glyph,
  accentColor = '#008D88',
  onTraceProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const strokePointsRef = useRef<number>(0);
  const [coverage, setCoverage] = useState(0);

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Subtle elementary writing baselines
    ctx.strokeStyle = '#E6EEF2';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(20, rect.height * 0.25);
    ctx.lineTo(rect.width - 20, rect.height * 0.25);
    ctx.moveTo(20, rect.height * 0.5);
    ctx.lineTo(rect.width - 20, rect.height * 0.5);
    ctx.moveTo(20, rect.height * 0.78);
    ctx.lineTo(rect.width - 20, rect.height * 0.78);
    ctx.stroke();

    // Dotted target letter or number outline
    const fontSize = Math.min(176, rect.height * 0.72);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${fontSize}px "Outfit", system-ui, sans-serif`;

    ctx.fillStyle = '#F5F9FA';
    ctx.fillText(glyph, rect.width / 2, rect.height / 2 + 4);

    ctx.strokeStyle = '#B8CDD6';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 9]);
    ctx.strokeText(glyph, rect.width / 2, rect.height / 2 + 4);

    // Prepare brush defaults
    ctx.setLineDash([]);
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = accentColor;

    strokePointsRef.current = 0;
    setCoverage(0);
    onTraceProgress?.(0);
  }, [glyph, accentColor, onTraceProgress]);

  useEffect(() => {
    drawGuide();
    const handleResize = () => drawGuide();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawGuide]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
    const p = getPoint(e);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();

    strokePointsRef.current += 1;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const p = getPoint(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    strokePointsRef.current += 1;
    const pct = Math.min(100, Math.round((strokePointsRef.current / 55) * 100));
    if (pct !== coverage) {
      setCoverage(pct);
      onTraceProgress?.(pct);
    }
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
  };

  return (
    <div>
      <div className="relative rounded-2xl border-2 border-[#B7D5E0] bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label={`Tracing practice area for ${glyph}`}
          className="block w-full h-[250px] touch-none cursor-crosshair"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[#51617B] tabular-nums">
          {coverage >= 80
            ? `Great tracing effort (${coverage}%) — ready to mark complete!`
            : `Trace over the dotted ${glyph} · Effort: ${coverage}%`}
        </div>
        <button
          type="button"
          onClick={drawGuide}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-[#C5E7E2] bg-white px-4 py-2 text-sm font-bold text-[#078F89] hover:bg-[#EDFBF9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Clear Tracing
        </button>
      </div>
    </div>
  );
};
