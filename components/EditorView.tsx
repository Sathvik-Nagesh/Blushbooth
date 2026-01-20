
import React, { useState, useEffect, useCallback } from 'react';
import { FilterSettings, FilterType, TemplateType, PhotoData, AIPreset, BorderPattern } from '../types';
import { applyFiltersAndTemplate } from '../services/canvasService';
import { enhanceImage } from '../services/geminiService';
import { 
  Check, X, Wand2, Loader2, Download, 
  Layout, Image as ImageIcon, Sparkles, Film, 
  Zap, Heart, Clapperboard, RefreshCcw
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface EditorViewProps {
  images: string[];
  onSave: (photo: PhotoData) => void;
  onCancel: () => void;
  initialBorderPattern?: BorderPattern;
}

export const EditorView: React.FC<EditorViewProps> = ({ images, onSave, onCancel, initialBorderPattern = BorderPattern.NONE }) => {
  const [layoutPreview, setLayoutPreview] = useState<string>(images[0] || '');
  const [isRendering, setIsRendering] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedImages, setEnhancedImages] = useState<string[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [loadedRawImages, setLoadedRawImages] = useState<HTMLImageElement[]>([]);
  const [loadedEnhancedImages, setLoadedEnhancedImages] = useState<HTMLImageElement[]>([]);

  const [selectedPreset, setSelectedPreset] = useState<AIPreset>(AIPreset.NONE);
  const [appliedPreset, setAppliedPreset] = useState<AIPreset>(AIPreset.NONE);
  const [activeTab, setActiveTab] = useState<'magic' | 'templates' | 'adjust'>('magic');

  const [settings, setSettings] = useState<FilterSettings>({
    brightness: 0, contrast: 0, blur: 0, grain: 0, type: FilterType.NORMAL,
  });

  const [template, setTemplate] = useState<TemplateType>(
    images.length > 1 ? TemplateType.STRIP : TemplateType.POLAROID
  );
  const [borderPattern, setBorderPattern] = useState<BorderPattern>(initialBorderPattern);

  // Load images once
  useEffect(() => {
    Promise.all(images.map(src => new Promise<HTMLImageElement>(r => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => r(img);
      img.src = src;
    }))).then(setLoadedRawImages);
  }, [images]);

  useEffect(() => {
    if (!enhancedImages) return setLoadedEnhancedImages([]);
    Promise.all(enhancedImages.map(src => new Promise<HTMLImageElement>(r => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => r(img);
      img.src = src;
    }))).then(setLoadedEnhancedImages);
  }, [enhancedImages]);

  // Debounced update with longer delay
  useEffect(() => {
    let isMounted = true;
    const useEnhanced = !!enhancedImages && loadedEnhancedImages.length > 0;
    const imagesToUse = useEnhanced ? enhancedImages : images;
    const preloaded = useEnhanced ? loadedEnhancedImages : loadedRawImages;

    if (preloaded.length !== imagesToUse.length) return;

    setIsRendering(true);
    const timeoutId = setTimeout(async () => {
      const result = await applyFiltersAndTemplate(imagesToUse, settings, template, borderPattern, 600, 600, false, preloaded);
      if (isMounted) {
        setLayoutPreview(result);
        setIsRendering(false);
      }
    }, 150); // Longer debounce

    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, [template, images, enhancedImages, loadedRawImages, loadedEnhancedImages, borderPattern, settings]);

  const handleApplyEnhance = async () => {
    if (isEnhancing) return;
    if (selectedPreset === AIPreset.NONE) {
      setEnhancedImages(null);
      setAppliedPreset(AIPreset.NONE);
      return;
    }
    setIsEnhancing(true);
    try {
      const results = await Promise.all(images.map(img => enhanceImage(img, selectedPreset)));
      setEnhancedImages(results);
      setAppliedPreset(selectedPreset);
    } catch {
      alert("AI Magic unavailable right now.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const sourceImages = enhancedImages || images;
      const finalResult = await applyFiltersAndTemplate(sourceImages, settings, template, borderPattern, 1200, 1200);
      
      // Convert Data URL to Blob for better download reliability
      const res = await fetch(finalResult);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `blushbooth-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);

      const photoData: PhotoData = {
        id: uuidv4(),
        original: finalResult,
        enhanced: enhancedImages ? finalResult : undefined,
        assets: images,
        timestamp: Date.now(),
        template,
        filter: settings.type,
        borderPattern,
        aiPreset: appliedPreset,
      };

      onSave(photoData);
    } catch (error) {
      console.error('Save error:', error);
      alert("Failed to save photo. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const presets = [
    { id: AIPreset.NONE, label: 'Original', icon: X },
    { id: AIPreset.GLOW, label: 'Glow', icon: Sparkles },
    { id: AIPreset.BOLLYWOOD, label: 'Bolly', icon: Film },
    { id: AIPreset.RETRO_ANIME, label: 'Anime', icon: Heart },
    { id: AIPreset.VINTAGE_NOIR, label: 'Noir', icon: Clapperboard },
    { id: AIPreset.CYBER, label: 'Cyber', icon: Zap },
  ];

  const patterns = [
    { id: BorderPattern.NONE, label: 'Plain', emoji: '⬜' },
    { id: BorderPattern.HEARTS, label: 'Hearts', emoji: '💕' },
    { id: BorderPattern.STARS, label: 'Stars', emoji: '⭐' },
    { id: BorderPattern.DOTS, label: 'Dots', emoji: '🔵' },
    { id: BorderPattern.CHECKER, label: 'Checker', emoji: '🏁' },
    { id: BorderPattern.STRIPED, label: 'Striped', emoji: '📏' },
    { id: BorderPattern.FLORAL, label: 'Floral', emoji: '🌸' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 animate-fade-in pb-24 md:pb-6">
      
      {/* Preview */}
      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-full max-w-[280px] md:max-w-sm bg-white p-3 rounded-lg shadow-lg border border-rose-100">
          <img 
            src={layoutPreview} 
            alt="Preview" 
            className={`w-full h-auto rounded transition-opacity ${isRendering ? 'opacity-70' : 'opacity-100'}`}
          />
          {(isEnhancing || isRendering) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded">
              <Loader2 className="animate-spin text-rose-500" size={28} />
            </div>
          )}
        </div>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-3 mt-6 w-full max-w-sm">
          <button onClick={onCancel} className="flex-1 py-3 bg-white text-slate-500 rounded-xl font-bold border border-slate-100 hover:bg-red-50 hover:text-red-500">
            <X size={18} className="inline mr-1" /> Discard
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex-[1.5] py-3 bg-rose-500 text-white rounded-xl font-bold shadow-md disabled:opacity-60">
            {isSaving ? <Loader2 className="inline animate-spin mr-1" size={18} /> : <Check size={18} className="inline mr-1" />}
            {isSaving ? 'Saving...' : 'Keep It! 💕'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full lg:w-[380px] bg-white rounded-2xl shadow-md border border-rose-50 p-4">
        
        {/* Tabs */}
        <div className="flex p-1 bg-rose-50 rounded-xl mb-4">
          {[
            { id: 'magic', label: '✨ Magic' },
            { id: 'templates', label: '🖼️ Layout' },
            { id: 'adjust', label: '🎨 Adjust' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === tab.id ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-h-[35vh] md:max-h-none overflow-y-auto scrollbar-hide">
          
          {/* Magic Tab */}
          {activeTab === 'magic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-colors ${
                      selectedPreset === preset.id 
                        ? 'border-rose-400 bg-rose-50' 
                        : 'border-rose-100 bg-white'
                    }`}
                  >
                    <preset.icon size={18} className={`mx-auto mb-1 ${selectedPreset === preset.id ? 'text-rose-500' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-bold block">{preset.label}</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={handleApplyEnhance}
                disabled={isEnhancing || selectedPreset === appliedPreset}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
                  selectedPreset === appliedPreset 
                    ? 'bg-slate-100 text-slate-400' 
                    : 'bg-rose-500 text-white'
                }`}
              >
                {isEnhancing ? <>Processing...</> : selectedPreset === appliedPreset ? <>✓ Applied</> : <><Wand2 size={18} /> Apply Magic</>}
              </button>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: TemplateType.STRIP, label: 'Strip', icon: Layout },
                  { id: TemplateType.POLAROID, label: 'Polaroid', icon: ImageIcon },
                  { id: TemplateType.SQUARE_FRAME, label: 'Square', icon: ImageIcon },
                  { id: TemplateType.NONE, label: 'Plain', icon: Layout },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`p-3 rounded-xl border-2 ${template === t.id ? 'border-rose-400 bg-rose-50' : 'border-rose-100'}`}
                  >
                    <t.icon size={20} className={`mx-auto mb-1 ${template === t.id ? 'text-rose-500' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold block text-center">{t.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="pt-3 border-t border-rose-50">
                <p className="text-xs font-bold text-rose-600 mb-2">Border Pattern</p>
                <div className="flex flex-wrap gap-1.5">
                  {patterns.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setBorderPattern(p.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        borderPattern === p.id ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {p.emoji} {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Adjust Tab */}
          {activeTab === 'adjust' && (
            <div className="space-y-4">
              {[
                { label: 'Brightness', key: 'brightness', min: -50, max: 50 },
                { label: 'Contrast', key: 'contrast', min: -50, max: 50 },
                { label: 'Blur', key: 'blur', min: 0, max: 5 },
                { label: 'Grain', key: 'grain', min: 0, max: 50 },
              ].map(control => (
                <div key={control.key}>
                  <div className="flex justify-between mb-1">
                    <label
                      htmlFor={`adjust-${control.key}`}
                      className="text-xs font-bold text-slate-500 cursor-pointer hover:text-rose-500 transition-colors"
                    >
                      {control.label}
                    </label>
                    <span className="text-xs text-rose-500 font-mono">{settings[control.key as keyof FilterSettings]}</span>
                  </div>
                  <input
                    id={`adjust-${control.key}`}
                    type="range"
                    min={control.min}
                    max={control.max}
                    value={settings[control.key as keyof FilterSettings]}
                    onChange={(e) => setSettings(s => ({ ...s, [control.key]: Number(e.target.value) }))}
                    onDoubleClick={() => setSettings(s => ({ ...s, [control.key]: 0 }))}
                    title="Double-click to reset"
                    className="w-full cursor-pointer"
                  />
                </div>
              ))}
              
              <div className="pt-3 border-t border-rose-50">
                <p className="text-xs font-bold text-slate-500 mb-2">Filters</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.values(FilterType).map(f => (
                    <button
                      key={f}
                      onClick={() => setSettings(s => ({ ...s, type: f }))}
                      className={`py-1.5 rounded-lg text-[10px] font-bold capitalize ${
                        settings.type === f ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-rose-100 flex gap-2 md:hidden z-50 safe-area-bottom">
        <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm">
          Discard
        </button>
        <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3 bg-rose-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-60">
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
          {isSaving ? 'Saving...' : 'Keep It! 💕'}
        </button>
      </div>
    </div>
  );
};
