import { useState } from "react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileDown, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ImageToPdfWizardModal({ isOpen, onClose }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const convertToPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const pdf = new jsPDF();
      let isFirstPage = true;

      for (const file of files) {
        const imgData = await readFileAsDataURL(file);
        const img = new Image();
        img.src = imgData;
        await new Promise((resolve) => (img.onload = resolve));

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
        pdf.addImage(imgData, "JPEG", 0, 0, finalWidth, finalHeight);
        isFirstPage = false;
      }

      pdf.save("ahadex-images.pdf");
      setFiles([]);
      onClose();
    } catch (error) {
      console.error("Error creating PDF:", error);
      alert("Something went wrong while creating the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
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
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                <input type="file" multiple accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer" />
                <p className="text-xs text-gray-400 mt-2">Select multiple images to merge into one PDF.</p>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">Selected Files ({files.length}):</h3>
                  <ul className="space-y-2 mb-6 max-h-32 overflow-y-auto">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="truncate">{f.name}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={convertToPdf} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
                    {isProcessing ? "Converting to PDF..." : "Convert to PDF"}
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
