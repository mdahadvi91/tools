import { useState, useRef } from "react";
import { X, Upload, Copy, Check, Pipette, ZoomIn } from "lucide-react";

export function ColorPickerWizard({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [color, setColor] = useState<{ hex: string, rgb: string, hsl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(f);
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0], g = pixel[1], b = pixel[2];
    
    const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    const rgbStr = `rgb(${r}, ${g}, ${b})`;
    const hslStr = rgbToHsl(r, g, b);
    
    setColor({ hex, rgb: rgbStr, hsl: hslStr });
  };

  const useEyeDropper = async () => {
    if (!('EyeDropper' in window)) {
      alert("Your browser does not support the EyeDropper API.");
      return;
    }
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      const hex = result.sRGBHex.toUpperCase();
      
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      setColor({ 
        hex, 
        rgb: `rgb(${r}, ${g}, ${b})`, 
        hsl: rgbToHsl(r, g, b) 
      });
    } catch (e) {
      console.log("EyeDropper cancelled");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X className="w-5 h-5"/></button>
        <h2 className="text-xl font-bold mb-6">Color Picker</h2>
        
        {!image ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-10 text-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-4" />
            <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-gray-500" />
                <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-32" />
                <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
              </div>
              <button onClick={useEyeDropper} className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-gray-700 px-3 py-1.5 rounded shadow border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Pipette className="w-4 h-4" /> Use System EyeDropper
              </button>
            </div>

            <div className="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-auto max-h-[400px] cursor-crosshair relative">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                <img 
                  src={image} 
                  alt="Upload" 
                  className="hidden" 
                  ref={imgRef} 
                  onLoad={() => {
                    const canvas = canvasRef.current;
                    const img = imgRef.current;
                    if (canvas && img) {
                      canvas.width = img.naturalWidth;
                      canvas.height = img.naturalHeight;
                      const ctx = canvas.getContext("2d");
                      ctx?.drawImage(img, 0, 0);
                    }
                  }}
                />
                <canvas 
                  ref={canvasRef} 
                  onClick={pickColor}
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            {color && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">HEX</p>
                    <p className="font-mono font-bold text-lg">{color.hex}</p>
                  </div>
                  <button onClick={() => copyToClipboard(color.hex)} className="p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">RGB</p>
                    <p className="font-mono font-bold text-sm">{color.rgb}</p>
                  </div>
                  <button onClick={() => copyToClipboard(color.rgb)} className="p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 col-span-full">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">HSL</p>
                      <p className="font-mono font-bold text-sm">{color.hsl}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: color.hex }} />
                  </div>
                  <button onClick={() => copyToClipboard(color.hsl)} className="p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}