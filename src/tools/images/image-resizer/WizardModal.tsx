import { useState, useRef } from "react";
import { X, Upload, Loader2, Download } from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PIXELS = 10000 * 10000; // 100 Megapixels
const MAX_DIMENSION = 10000;

export function ImageResizerWizard({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [ratio, setRatio] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    if (f.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 50MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Invalid file type. Please upload JPG, PNG, or WebP.");
      return;
    }

    setError(null);
    setFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
        setRatio(img.width / img.height);
        setPreview(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(f);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio) setHeight(Math.round(val / ratio));
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio) setWidth(Math.round(val * ratio));
  };

  const handleResize = () => {
    if (!preview || !imgRef.current) return;
    
    if (width <= 0 || height <= 0) {
      setError("Width and height must be greater than 0.");
      return;
    }
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      setError(`Dimensions cannot exceed ${MAX_DIMENSION}px.`);
      return;
    }
    if (width * height > MAX_PIXELS) {
      setError("Output resolution is too large. Please reduce dimensions.");
      return;
    }

    setError(null);
    setIsProcessing(true);
    
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(imgRef.current!, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL(file?.type || "image/jpeg", 0.95);
        const a = document.createElement("a");
        a.href = resizedDataUrl;
        a.download = `resized-${file?.name || 'image.jpg'}`;
        a.click();
      }
      setIsProcessing(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X className="w-5 h-5"/></button>
        <h2 className="text-xl font-bold mb-6">Image Resizer</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-10 text-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-4" />
            <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center bg-gray-100 dark:bg-gray-800 p-2 rounded-xl max-h-48 overflow-hidden">
              <img ref={imgRef} src={preview!} alt="Preview" className="max-h-44 object-contain" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Width (px)</label>
                <input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Height (px)</label>
                <input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Lock Aspect Ratio</span>
            </label>

            <button onClick={handleResize} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl font-bold transition disabled:opacity-50">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isProcessing ? "Processing..." : "Resize & Download"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}