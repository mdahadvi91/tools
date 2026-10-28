import { useState, useRef } from "react";
import { X, Upload, Copy, Check } from "lucide-react";

export function ColorPickerWizard({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [color, setColor] = useState<{ hex: string, rgb: string } | null>(null);
  const [copied, setCopied] = useState(false);
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
    setColor({ hex, rgb: `rgb(${r}, ${g}, ${b})` });
  };

  const copyToClipboard = () => {
    if (!color) return;
    navigator.clipboard.writeText(color.hex);
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
            <div className="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden cursor-crosshair relative">
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
                className="max-h-[400px] w-auto h-auto object-contain"
              />
            </div>

            {color && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600" style={{ backgroundColor: color.hex }} />
                  <div>
                    <p className="font-bold text-lg">{color.hex}</p>
                    <p className="text-sm text-gray-500">{color.rgb}</p>
                  </div>
                </div>
                <button onClick={copyToClipboard} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy HEX"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}