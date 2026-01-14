
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Play, Volume2, VolumeX, Timer, Settings2, Palette } from 'lucide-react';
import { CaptureMode, BorderPattern } from '../types';

interface CameraViewProps {
  onCapture: (images: string[], pattern?: BorderPattern) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  
  const [hasStarted, setHasStarted] = useState(false);
  const [captureMode, setCaptureMode] = useState<CaptureMode>(1);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<BorderPattern>(BorderPattern.NONE);
  
  const [isMuted, setIsMuted] = useState(false);
  const [timerDuration, setTimerDuration] = useState<3 | 5 | 10>(3);
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    setError('');
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      setError('Could not access camera. Please allow permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const playSound = (type: 'count' | 'shutter') => {
    if (isMuted) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    if (type === 'count') {
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      noise.start(now);
    }
  };

  const startBoothSequence = () => {
    setCapturedImages([]);
    loopSequence([], captureMode);
  };

  const loopSequence = (currentImages: string[], target: number) => {
    if (currentImages.length >= target) {
      setTimeout(() => onCapture(currentImages, selectedPattern), 400);
      return;
    }

    setCountdown(timerDuration);
    playSound('count');

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          performCapture(currentImages, target);
          return null;
        }
        if (prev) playSound('count');
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const performCapture = (currentImages: string[], target: number) => {
    if (!videoRef.current) return;
    
    playSound('shutter');
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    const video = videoRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/png');
      const newBatch = [...currentImages, dataUrl];
      setCapturedImages(newBatch);
      setTimeout(() => loopSequence(newBatch, target), 1200);
    }
  };

  const patternOptions = [
    { id: BorderPattern.NONE, label: 'Plain', emoji: '⬜' },
    { id: BorderPattern.HEARTS, label: 'Hearts', emoji: '💕' },
    { id: BorderPattern.STARS, label: 'Stars', emoji: '⭐' },
    { id: BorderPattern.DOTS, label: 'Dots', emoji: '🔵' },
    { id: BorderPattern.CHECKER, label: 'Checker', emoji: '🏁' },
    { id: BorderPattern.STRIPED, label: 'Striped', emoji: '📏' },
    { id: BorderPattern.FLORAL, label: 'Floral', emoji: '🌸' },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto py-4 animate-fade-in">
      
      {/* Photo Booth Container */}
      <div className="w-full bg-white rounded-2xl md:rounded-3xl shadow-lg p-3 md:p-6 border border-rose-100">
        
        {/* Branding - Desktop only */}
        <div className="hidden md:flex justify-center mb-4">
          <div className="bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-2 rounded-xl text-white">
            <h2 className="text-lg font-bold tracking-wide">✨ BlushBooth ✨</h2>
          </div>
        </div>

        {/* Camera Screen */}
        <div className="relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden mb-3">
          
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
              <Camera size={40} className="text-rose-300 mb-3" />
              <p>{error}</p>
              <button onClick={startCamera} className="mt-3 px-4 py-2 bg-rose-500 rounded-full text-sm font-bold">
                Try Again
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
            />
          )}

          {/* Quick Controls */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-black/40 rounded-full text-white"
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
              className="p-2 bg-black/40 rounded-full text-white"
              aria-label="Switch camera"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Captured Preview */}
          {capturedImages.length > 0 && capturedImages.length < captureMode && (
            <div className="absolute bottom-2 left-2 flex gap-1">
              {capturedImages.map((img, i) => (
                <div key={i} className="w-10 h-10 bg-white p-0.5 rounded shadow">
                  <img src={img} className="w-full h-full object-cover rounded" alt="" />
                </div>
              ))}
            </div>
          )}

          {/* Countdown */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-7xl font-bold text-white animate-pop">{countdown}</span>
            </div>
          )}

          {/* Flash */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
          )}

          {/* Start Overlay */}
          {!hasStarted && !countdown && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-white text-center">
              
              <div className="bg-rose-500/20 p-3 rounded-full mb-3">
                <Camera size={28} className="text-rose-300" />
              </div>
              <h2 className="text-xl font-bold mb-1">Ready to Shine? ✨</h2>
              <p className="text-sm text-rose-200 mb-4">Choose your style!</p>
              
              {/* Format Selector */}
              <div className="flex gap-2 mb-4">
                {[
                  { m: 1, label: '📸 Single' },
                  { m: 3, label: '🎞️ 3-Strip' },
                  { m: 4, label: '📷 4-Strip' }
                ].map((opt) => (
                  <button 
                    key={opt.m}
                    onClick={() => {
                      setCaptureMode(opt.m as CaptureMode);
                      if (opt.m === 1) setSelectedPattern(BorderPattern.NONE);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      captureMode === opt.m 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Pattern Selector */}
              {(captureMode === 3 || captureMode === 4) && (
                <div className="mb-4">
                  <p className="text-xs text-rose-200 mb-2 flex items-center justify-center gap-1">
                    <Palette size={12} /> Border Pattern
                  </p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {patternOptions.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPattern(p.id)}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          selectedPattern === p.id 
                            ? 'bg-white text-rose-600' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {p.emoji} {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => setHasStarted(true)}
                className="px-6 py-3 bg-white text-rose-600 rounded-full font-bold text-sm flex items-center gap-2"
              >
                <Play size={18} fill="currentColor" />
                Open Booth
              </button>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className={`bg-rose-50 rounded-xl p-3 transition-opacity ${hasStarted ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-center justify-between max-w-sm mx-auto">
            
            {/* Timer */}
            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                <Timer size={10} /> Timer
              </span>
              <div className="flex gap-1">
                {[3, 5, 10].map(t => (
                  <button
                    key={t}
                    onClick={() => setTimerDuration(t as any)}
                    className={`w-7 h-7 rounded text-xs font-bold ${
                      timerDuration === t 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-white text-rose-400'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            {/* Shutter Button */}
            <button
              onClick={startBoothSequence}
              disabled={!!countdown}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform disabled:opacity-50 -mt-6"
              aria-label="Take photo"
            >
              <Play className="ml-1" size={24} fill="white" />
            </button>

            {/* Reset */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                <Settings2 size={10} /> Reset
              </span>
              <button
                onClick={() => {
                  setHasStarted(false);
                  setCapturedImages([]);
                  setSelectedPattern(BorderPattern.NONE);
                }}
                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-rose-400 hover:text-rose-600"
                aria-label="Reset camera"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
