
import React, { useEffect, useState } from 'react';
import { applyFiltersAndTemplate } from '../services/canvasService';
import { TemplateType, FilterType, BorderPattern } from '../types';

interface PrintingAnimationProps {
  images: string[];
  onComplete: () => void;
  borderPattern?: BorderPattern;
}

export const PrintingAnimation: React.FC<PrintingAnimationProps> = ({ images, onComplete, borderPattern = BorderPattern.NONE }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const preparePreview = async () => {
      const template = images.length > 1 ? TemplateType.STRIP : TemplateType.POLAROID;
      const result = await applyFiltersAndTemplate(
        images,
        { brightness: 0, contrast: 0, blur: 0, grain: 0, type: FilterType.NORMAL },
        template,
        borderPattern,
        280,
        280
      );
      setPreview(result);
    };
    preparePreview();

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => prev >= 100 ? 100 : prev + 3);
    }, 100);

    const timer = setTimeout(onComplete, 3500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [images, onComplete, borderPattern]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center">
       
      {/* Machine Slot */}
      <div className="w-[320px] h-20 bg-slate-800 rounded-xl flex items-center justify-center mb-4 border-b-4 border-slate-950">
        <div className="w-[280px] h-3 bg-black rounded-full"></div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-white/60 text-xs font-mono uppercase tracking-wider">Printing...</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-rose-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Photo */}
      <div className="w-[280px] overflow-hidden -mt-2">
        {preview && (
          <div className="animate-print-slide">
            <div className="bg-white p-2 rounded-b shadow-xl">
              <img src={preview} alt="Printing" className="w-full rounded" />
            </div>
          </div>
        )}
      </div>

      <p className="text-white/40 text-sm mt-6">Creating your memory... 💕</p>
    </div>
  );
};
