import { useState } from "react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileDown, Loader2, CheckCircle2 } from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB total
const MAX_IMAGES = 20;
const MAX_PIXELS = 10000 * 10000; // 100MP per image
const SUPPORTED_MIMES = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ImageToPdfWizardModal({ isOpen, onClose }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Validate count
    if (files.length + newFiles.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed. You selected ${newFiles.length} new (total ${files.length + newFiles.length}).`);
      return;
    }
    
    // Validate each file
    for (const f of newFiles) {
      if (f.size > MAX_FILE_SIZE) {
        setError(`${f.name} is too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Max 50MB per file.`);
        return;
      }
      if (!SUPPORTED_MIMES.includes(f.type)) {
        setError(`${f.name}: unsupported format. Use JPG, PNG, or WebP.`);
        return;
      }
    }
    
    // Validate total size
    const totalSize = [...files, ...newFiles].reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setError(`Total size exceeds 200MB. Please select fewer/smaller files.`);
      return;
    }
    
    setError(null);
    setFiles([...files, ...newFiles]);
    e.target.value = ""; // Reset input
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setError(null);
  };

  const convertToPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const pdf = new jsPDF();
      let isFirstPage = true;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Read file
        const imgData = await readFileAsDataURL(file);
        
        // Decode image
        const img = new Image();
        img.src = imgData;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to decode ${file.name}`));
        });
        
        // Validate pixel count
        if (img.width * img.height > MAX_PIXELS) {
          throw new Error(`${file.name} resolution too large (${img.width}x${img.height}). Max 100MP.`);
        }

        // Calculate dimensions to fit A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgRatio = img.width / img.height;
        const pdfRatio = pdfWidth / pdfHeight;

        let finalWidth = pdfWidth;
        let finalHeight = pdfWidth / imgRatio;

        if (imgRatio < pdfRatio) {
          finalHeight = pdfHeight;
          finalWidth = pdfHeight * imgRatio;
        }

        if (!isFirstPage) pdf.addPage();
        
        // Detect actual format (jsPDF supports PNG and JPEG)
        const format = file.type === "image/png" ? "PNG" : "JPEG";
        pdf.addImage(imgData, format, 0, 0, finalWidth, finalHeight);
        isFirstPage = false;
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // Use Blob instead of data URI for memory efficiency
      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ahadex-images-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      setFiles([]);
      setProgress(0);
      onClose();
    } catch (err: any) {
      console.error("Error creating PDF:", err);
      setError(err.message || "Something went wrong while creating the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold">Convert Images to PDF</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                <input 
                  type="file" 
                  multiple 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleFileChange} 
                  disabled={isProcessing}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer disabled:opacity-50" 
                />
                <p className="text-xs text-gray-400 mt-2">Max 20 images, 50MB each, 200MB total.</p>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">Selected Files ({files.length}/{MAX_IMAGES}):</h3>
                  <ul className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="truncate flex-1">{f.name}</span>
                        <button onClick={() => removeFile(i)} disabled={isProcessing} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50">
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  {isProcessing && (
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">{progress}%</p>
                    </div>
                  )}
                  <button onClick={convertToPdf} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
                    {isProcessing ? `Converting... ${progress}%` : "Convert to PDF"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
