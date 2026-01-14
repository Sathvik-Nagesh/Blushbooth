
import React, { useState, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { EditorView } from './components/EditorView';
import { GalleryView } from './components/GalleryView';
import { PrintingAnimation } from './components/PrintingAnimation';
import { AppMode, PhotoData, BorderPattern } from './types';
import { History, Camera, Sparkles, ImageIcon } from 'lucide-react';
import { savePhotoToDB, getPhotosFromDB, deletePhotoFromDB } from './services/storageService';

const LOCAL_STORAGE_KEY = 'blushbooth_photos';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.CAMERA);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<BorderPattern>(BorderPattern.NONE);

  useEffect(() => {
    const initStorage = async () => {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          const localPhotos: PhotoData[] = JSON.parse(stored);
          for (const p of localPhotos) {
            await savePhotoToDB(p);
          }
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (e) {
          console.error("Migration failed", e);
        }
      }

      try {
        const dbPhotos = await getPhotosFromDB();
        setPhotos(dbPhotos);
      } catch (e) {
        console.error("Failed to load photos from DB", e);
      }
    };

    initStorage();
  }, []);

  const savePhoto = async (photo: PhotoData) => {
    try {
      await savePhotoToDB(photo);
      const newPhotos = [photo, ...photos];
      setPhotos(newPhotos);
      setMode(AppMode.GALLERY);
    } catch (error) {
      console.error("Failed to save photo:", error);
      alert("Oops! We couldn't save your photo.");
    }
  };

  const deletePhoto = async (id: string) => {
    try {
      await deletePhotoFromDB(id);
      const newPhotos = photos.filter(p => p.id !== id);
      setPhotos(newPhotos);
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  };

  const handleCapture = (images: string[], pattern: BorderPattern = BorderPattern.NONE) => {
    setCurrentPhotos(images);
    setSelectedPattern(pattern);
    setMode(AppMode.PRINTING);
  };

  const handlePrintingComplete = () => {
    setMode(AppMode.EDITOR);
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans overflow-x-hidden">
      
      {/* Header - Lightweight */}
      {mode !== AppMode.PRINTING && (
        <nav className="fixed top-0 left-0 right-0 px-4 py-2 z-50 flex justify-between items-center bg-white/95 shadow-sm border-b border-rose-100 h-14">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setMode(AppMode.CAMERA)}
          >
            <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-1.5 rounded-lg text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="text-lg font-extrabold text-rose-500">
              BlushBooth
            </h1>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl">
            <button 
              onClick={() => setMode(AppMode.CAMERA)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                mode === AppMode.CAMERA 
                  ? 'bg-white text-rose-600 shadow-sm' 
                  : 'text-rose-400 hover:text-rose-600'
              }`}
            >
              <Camera size={16} />
              <span className="hidden sm:inline">Capture</span>
            </button>
            
            <button 
              onClick={() => setMode(AppMode.GALLERY)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                mode === AppMode.GALLERY 
                  ? 'bg-white text-rose-600 shadow-sm' 
                  : 'text-rose-400 hover:text-rose-600'
              }`}
            >
              <ImageIcon size={16} />
              <span className="hidden sm:inline">Memories</span>
              {photos.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-rose-500 text-white text-[9px] font-bold rounded-full">
                  {photos.length > 99 ? '99+' : photos.length}
                </span>
              )}
            </button>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={`${mode !== AppMode.PRINTING ? 'pt-16 pb-4' : ''} px-3 max-w-4xl mx-auto min-h-screen flex flex-col`}>
        {mode === AppMode.CAMERA && (
          <CameraView onCapture={handleCapture} />
        )}
        
        {mode === AppMode.PRINTING && currentPhotos.length > 0 && (
           <PrintingAnimation 
              images={currentPhotos} 
              onComplete={handlePrintingComplete} 
              borderPattern={selectedPattern}
           />
        )}

        {mode === AppMode.EDITOR && currentPhotos.length > 0 && (
          <EditorView 
            images={currentPhotos} 
            onSave={savePhoto}
            onCancel={() => setMode(AppMode.CAMERA)}
            initialBorderPattern={selectedPattern}
          />
        )}

        {mode === AppMode.GALLERY && (
          <GalleryView 
            photos={photos} 
            onDelete={deletePhoto} 
            onBack={() => setMode(AppMode.CAMERA)}
          />
        )}
      </main>
    </div>
  );
}
