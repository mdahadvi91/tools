import { useRef, useState, ReactNode } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { cn } from "@lib/cn";

export function ZoomablePreview({ children, className }: { children: ReactNode, className?: string }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);

  const touchState = useRef<any>(null);
  const mouseState = useRef<any>(null);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const center = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
      touchState.current = { dist, center, startZoom: zoom, startPan: pan };
    } else if (e.touches.length === 1) {
      setIsPinching(false);
      touchState.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, startPan: pan };
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchState.current) return;
    if (e.touches.length === 2 && !isPinching) {
      setIsPinching(true);
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const center = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
      touchState.current = { dist, center, startZoom: zoom, startPan: pan };
      return;
    }
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const center = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
      const newZoom = Math.max(1, Math.min(5, touchState.current.startZoom * (dist / touchState.current.dist)));
      const scaleChange = newZoom / touchState.current.startZoom;
      setZoom(newZoom);
      setPan({ x: center.x - (center.x - touchState.current.startPan.x) * scaleChange, y: center.y - (center.y - touchState.current.startPan.y) * scaleChange });
    } else if (e.touches.length === 1 && !isPinching) {
      const dx = e.touches[0].clientX - touchState.current.x;
      const dy = e.touches[0].clientY - touchState.current.y;
      if (zoom > 1 && Math.hypot(dx, dy) > 3) {
        e.preventDefault();
        setPan({ x: touchState.current.startPan.x + dx, y: touchState.current.startPan.y + dy });
      }
    }
  };

  const onTouchEnd = () => {
    if (touchState.current && touchState.current.dist) touchState.current = null;
    else if (!isPinching) touchState.current = null;
    if (touchState.current === null) setIsPinching(false);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => { mouseState.current = { x: e.clientX, y: e.clientY, startPan: pan }; };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseState.current) return;
    const dx = e.clientX - mouseState.current.x;
    const dy = e.clientY - mouseState.current.y;
    if (zoom > 1 && Math.hypot(dx, dy) > 2) { setPan({ x: mouseState.current.startPan.x + dx, y: mouseState.current.startPan.y + dy }); }
  };
  const onMouseUp = () => { mouseState.current = null; };
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const newZoom = Math.max(1, Math.min(5, zoom - e.deltaY * 0.005));
    
    const center = { x: e.clientX, y: e.clientY };
    const scaleChange = newZoom / zoom;
    setZoom(newZoom);
    setPan({ x: center.x - (center.x - pan.x) * scaleChange, y: center.y - (center.y - pan.y) * scaleChange });
  };

  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center overflow-hidden touch-none", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-20 shadow-sm rounded-xl bg-white/90 dark:bg-gray-800/90 p-1.5 border border-silk-rose/20 backdrop-blur-md">
        <button type="button" onClick={() => setZoom(z => Math.min(5, z + 0.5))} className="w-9 h-9 flex items-center justify-center hover:bg-silk-rose/10 dark:hover:bg-silk-rose/20 rounded-lg text-silk-wine dark:text-silk-rose"><Plus className="w-5 h-5" /></button>
        <button type="button" onClick={resetView} className="w-9 h-9 flex items-center justify-center text-xs font-bold hover:bg-silk-rose/10 dark:hover:bg-silk-rose/20 rounded-lg text-silk-wine dark:text-silk-rose"><RotateCcw className="w-4 h-4" /></button>
        <button type="button" onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="w-9 h-9 flex items-center justify-center hover:bg-silk-rose/10 dark:hover:bg-silk-rose/20 rounded-lg text-silk-wine dark:text-silk-rose"><Minus className="w-5 h-5" /></button>
      </div>
      <div className="relative" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transition: isPinching ? 'none' : 'transform 0.1s ease-out', transformOrigin: 'center center' }}>
        {children}
      </div>
      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md z-20 pointer-events-none">
        {zoom.toFixed(1)}x
      </div>
    </div>
  );
}
