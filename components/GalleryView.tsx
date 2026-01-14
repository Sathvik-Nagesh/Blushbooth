import React, { useState } from 'react';
import { PhotoData } from '../types';
import { Trash2, Download, X, Calendar, ChevronLeft, Heart, Sparkles, ImageIcon } from 'lucide-react';

interface GalleryViewProps {
  photos: PhotoData[];
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ photos, onDelete, onBack }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const download = async (src: string, id: string) => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `blushbooth-${id}.png`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (e) {
      console.error("Download failed", e);
      // Fallback
      const link = document.createElement('a');
      link.href = src;
      link.download = `blushbooth-${id}.png`;
      link.click();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setSelectedPhoto(null);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="animate-fade-in pb-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 bg-white hover:bg-rose-50 rounded-lg text-rose-500 border border-rose-100">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-rose-800 flex items-center gap-2">
            <Heart size={20} className="text-rose-500" fill="currentColor" />
            Your Memories
          </h2>
          <p className="text-xs text-rose-400">{photos.length} photos saved</p>
        </div>
      </div>

      {/* Empty State */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center py-16 bg-white rounded-2xl border-2 border-dashed border-rose-200">
          <div className="bg-rose-50 p-4 rounded-full mb-4">
            <ImageIcon size={36} className="text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-rose-800 mb-1">No Memories Yet!</h3>
          <p className="text-rose-400 text-sm mb-4">Take some photos!</p>
          <button onClick={onBack} className="px-5 py-2 bg-rose-500 text-white rounded-full font-bold text-sm flex items-center gap-2">
            <Sparkles size={16} /> Start Capturing
          </button>
        </div>
      ) : (
        /* Photo Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div 
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="aspect-square bg-white rounded-xl p-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-rose-50"
            >
              <img 
                src={photo.enhanced || photo.original} 
                alt="Memory" 
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white rounded-2xl p-4 max-w-md w-full shadow-2xl animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500"
            >
              <X size={18} />
            </button>

            <div className="mt-4 mb-4">
              <img 
                src={selectedPhoto.enhanced || selectedPhoto.original} 
                alt="Selected" 
                className="w-full rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between px-1 mb-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {formatDate(selectedPhoto.timestamp)}
              </span>
              <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded text-xs font-bold">
                {selectedPhoto.filter}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => download(selectedPhoto.enhanced || selectedPhoto.original, selectedPhoto.id)}
                className="py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download
              </button>
              <button 
                onClick={() => handleDelete(selectedPhoto.id)}
                className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
                  deleteConfirm === selectedPhoto.id
                    ? 'bg-red-500 text-white'
                    : 'bg-red-50 text-red-500'
                }`}
              >
                <Trash2 size={16} /> {deleteConfirm === selectedPhoto.id ? 'Confirm' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};