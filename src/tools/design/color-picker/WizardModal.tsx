import { useState, useRef } from "react";
import { X, Upload, Copy, Check, Pipette, ZoomIn } from "lucide-react";

export function ColorPickerWizard({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [color, setColor] = useState<{ hex: string, rgb: string, hsl: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 50 * 1024 * 1024) {
      setError("File is too large. Maximum size is 50MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Invalid format. Please upload JPG, PNG, or WebP.");
      return;
    }

    setError(null);
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

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
      setError("Your browser does not support the EyeDropper API. Please use Chrome or Edge.");
      return;
    }
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
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
      setError(null);
    } catch (e) {
      // User cancelled - no error needed
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-3xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full z-10">
          <X className="w-5 h-5"/>
        </button>
        <h2 className="text-xl font-bold mb-6">Color Picker</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {!image ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-10 text-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-4" />
            <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-gray-500" />
                <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-32" />
                <span className="text-xs text-gray-500 w-12">{Math.round(zoom * 100)}%</span>
              </div>
              <button onClick={useEyeDropper} className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-gray-700 px-3 py-1.5 rounded-lg shadow border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                <Pipette className="w-4 h-4" /> System EyeDropper
              </button>
            </div>

            <div className="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-auto max-h-[400px] cursor-crosshair relative">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.1s' }}>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* HEX Card */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">HEX</p>
                    <p className="font-mono font-bold text-lg">{color.hex}</p>
                  </div>
                  <button onClick={() => copyToClipboard(color.hex, 'hex')} className="p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg">
                    {copied === 'hex' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* RGB Card */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">RGB</p>
                    <p className="font-mono font-bold text-sm">{color.rgb}</p>
                  </div>
                  <button onClick={() => copyToClipboard(color.rgb, 'rgb')} className="p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg">
                    {copied === 'rgb' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* HSL Card */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">HSL</p>
                      <p className="font-mono font-bold text-sm">{color.hsl}</p>
                    </div>
                  </div>
                  <button onClick={() => copyToClipboard(color.hsl, 'hsl')} className="p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg">
                    {copied === 'hsl' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
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
