import { useState, useRef } from "react";
import { X, Upload, Loader2, Download } from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PIXELS = 10000 * 10000; // 100 Megapixels

export function WebpConverterWizard({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [format, setFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
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
    if (f.type !== "image/webp") {
      setError("Please upload a valid WebP image.");
      return;
    }

    // Revoke previous URL to prevent memory leaks
    if (preview) URL.revokeObjectURL(preview);

    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleConvert = () => {
    if (!preview || !imgRef.current) return;
    setIsProcessing(true);
    
    if (imgRef.current!.naturalWidth * imgRef.current!.naturalHeight > MAX_PIXELS) {
      setError("Image resolution is too large to process safely.");
      setIsProcessing(false);
      return;
    }

    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = imgRef.current!.naturalWidth;
      canvas.height = imgRef.current!.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (format === "image/jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(imgRef.current!, 0, 0);
        
        const ext = format === "image/jpeg" ? "jpg" : "png";
        
        // Use toBlob instead of toDataURL for better memory efficiency
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `converted-${file?.name.split('.')[0] || 'image'}.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
          }
          setIsProcessing(false);
          onClose();
        }, format, 0.95);
        return;
      }
      setIsProcessing(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X className="w-5 h-5"/></button>
        <h2 className="text-xl font-bold mb-6">WebP Converter</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-10 text-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-4" />
            <input type="file" accept="image/webp" onChange={handleUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center bg-gray-100 dark:bg-gray-800 p-2 rounded-xl max-h-48 overflow-hidden">
              <img ref={imgRef} src={preview!} alt="Preview" className="max-h-44 object-contain" />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Output Format</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={format === "image/jpeg"} onChange={() => setFormat("image/jpeg")} className="w-4 h-4 text-red-600" />
                  <span>JPG (Smaller size)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={format === "image/png"} onChange={() => setFormat("image/png")} className="w-4 h-4 text-red-600" />
                  <span>PNG (Lossless)</span>
                </label>
              </div>
            </div>

            <button onClick={handleConvert} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl font-bold transition disabled:opacity-50">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isProcessing ? "Processing..." : "Convert & Download"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}