import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Heart, RotateCcw, CheckCircle2, LockOpen } from 'lucide-react';
import { SecretMessage } from '../../types/database';

interface CanvasScratchCardProps {
  messages: SecretMessage[];
}

const DEFAULT_SECRET_MESSAGE: SecretMessage = {
  id: 'secret-default',
  title: 'Surat Rahasia #1: Dari Daffa untuk Ciyan',
  message: 'Untuk Ciyan tercinta: Setiap detik bersamamu adalah anugerah terindah. Terima kasih telah selalu menjadi rumah bagi hatiku.',
  author: 'Daffa',
  scratch_percent_required: 40,
};

export const CanvasScratchCard: React.FC<CanvasScratchCardProps> = ({ messages = [] }) => {
  const [activeMessageIndex, setActiveMessageIndex] = useState<number>(0);
  const [scratchedPercent, setScratchedPercent] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const safeMessages = messages && messages.length > 0 ? messages : [DEFAULT_SECRET_MESSAGE];
  const currentMessage = safeMessages[activeMessageIndex] || safeMessages[0] || DEFAULT_SECRET_MESSAGE;

  // Initialize and paint scratch foil layer
  const initFoil = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Use container dimensions so foil fits the exact height of the message content without cut off
    const rect = container.getBoundingClientRect();
    const width = Math.max(Math.round(rect.width) || 320, 280);
    const height = Math.max(Math.round(rect.height) || 280, 240);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Reset composite operation to paint solid layer
    ctx.globalCompositeOperation = 'source-over';

    // Solid Vintage Pink & Soft Gold Foil gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#D8A7B1'); // Rose gold
    gradient.addColorStop(0.5, '#F9E2E7'); // Soft vintage pink
    gradient.addColorStop(1, '#C89D66'); // Antique brass

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle vintage pattern grid / dots on foil
    ctx.fillStyle = 'rgba(74, 30, 40, 0.15)';
    for (let x = 10; x < width; x += 20) {
      for (let y = 10; y < height; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Foil Banner Text responsive to width
    ctx.fillStyle = '#4A1E28';
    const isMobile = width < 420;
    ctx.font = isMobile ? 'bold 13px "Playfair Display", Georgia, serif' : 'bold 15px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Gores di Sini untuk Membaca Surat Rahasia ✨', width / 2, height / 2 - 12);

    ctx.font = isMobile ? 'italic 12px "Cormorant Garamond", Georgia, serif' : 'italic 13px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = '#6B2D39';
    ctx.fillText('Sentuh atau seret jarimu perlahan...', width / 2, height / 2 + 14);

    setScratchedPercent(0);
    setIsRevealed(false);
    lastPos.current = null;
  }, []);

  useEffect(() => {
    // Delay slightly to allow DOM to calculate container height based on text length
    const timer = setTimeout(() => {
      initFoil();
    }, 60);

    const handleResize = () => {
      initFoil();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [initFoil, activeMessageIndex]);

  // Scratch action logic - Purely manual scratching with smooth continuous stroke
  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 42;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 21, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPos.current = { x, y };

    // Update progress percentage without auto-clearing
    calculatePercent();
  };

  const calculatePercent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Sample pixels across grid for high performance
    const sampleStep = 8;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let transparentCount = 0;
    let totalSamples = 0;

    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        const alphaIndex = (y * width + x) * 4 + 3;
        totalSamples++;
        if (data[alphaIndex] < 128) {
          transparentCount++;
        }
      }
    }

    const pct = Math.round((transparentCount / totalSamples) * 100);
    setScratchedPercent(pct);

    if (pct >= 65 && !isRevealed) {
      setIsRevealed(true);
    }
  };

  // Optional manual reveal all on button click
  const handleRevealAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setScratchedPercent(100);
    setIsRevealed(true);
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    lastPos.current = null;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      isDrawing.current = true;
      lastPos.current = null;
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || e.touches.length === 0) return;
    scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  return (
    <section id="scratch-secret" className="relative my-16 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] mb-3">
          <Sparkles className="w-4 h-4 text-[#C89D66]" />
          <span>Interactive Canvas Scratch Card</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#4A1E28]">
          Surat Rahasia Bertinta Emas
        </h2>
        <p className="mt-2 text-base font-cormorant text-[#6B2D39] italic font-medium">
          Gores lapisan vintage di bawah ini dengan jarimu untuk mengungkap bisikan ketulusan hati.
        </p>
      </div>

      {/* Message Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {safeMessages.map((m, idx) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMessageIndex(idx)}
            className={`px-4 py-1.5 rounded-full text-xs font-serif font-semibold border-2 transition cursor-pointer ${
              activeMessageIndex === idx
                ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28] shadow-[2px_3px_0px_#4A1E28]'
                : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
            }`}
          >
            {m.title}
          </button>
        ))}
      </div>

      {/* Scratch Card Main Canvas Box */}
      <div className="max-w-xl mx-auto">
        <div className="relative scrapbook-card p-6 sm:p-8 bg-[#FFFDF9]">
          <div className="scrapbook-tape" />
          <div className="absolute top-3 right-4 scrapbook-pin" />

          {/* Card Title & Author */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39]">
              <Heart className="w-3.5 h-3.5 text-[#C89D66]" />
              <span>
                {currentMessage.author?.toLowerCase() === 'both' ||
                currentMessage.author?.toLowerCase() === 'kita berdua'
                  ? 'Dari Kita Berdua'
                  : currentMessage.author === 'Ciyan'
                  ? 'Dari Ciyan untuk Daffa'
                  : `Dari ${currentMessage.author || 'Daffa'} untuk Ciyan`}
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-[#6B2D39]">
              {scratchedPercent}% Tergores
            </span>
          </div>

          {/* Secret Message Container + Scratch Canvas Layer */}
          <div
            ref={containerRef}
            className="relative w-full min-h-[250px] sm:min-h-[270px] rounded-xl overflow-hidden border-2 border-[#D8A7B1] bg-[#FAF4F0] select-none shadow-inner"
          >
            {/* The Hidden Message Behind the Scratch Foil (Natural flow so it never gets cut off on mobile) */}
            <div className="w-full h-full p-4 sm:p-7 flex flex-col justify-center items-center text-center bg-[#FAF4F0] min-h-[250px] sm:min-h-[270px]">
              <div className="p-2 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] mb-2 text-[#6B2D39] shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#4A1E28] mb-2">
                {currentMessage.title}
              </h4>
              <p className="font-script text-base sm:text-xl text-[#6B2D39] leading-relaxed break-words max-w-full">
                &ldquo;{currentMessage.message}&rdquo;
              </p>
            </div>

            {/* The Scratchable Foil Canvas Layer on Top (Manual Scratching Without Auto-Disappear) */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none select-none z-10"
            />
          </div>

          {/* Card Action Controls & Status */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-dashed border-[#D8A7B1]">
            <div className="flex items-center gap-2">
              {scratchedPercent >= 65 ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pesan Rahasia Berhasil Dibaca!</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-serif text-[#6B2D39]">
                  <LockOpen className="w-4 h-4 text-[#C89D66]" />
                  <span>Gores bebas secara manual dengan jari/kursor</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRevealAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-serif font-semibold text-[#6B2D39] transition cursor-pointer shadow-xs"
                title="Buka seluruh lapisan foil secara manual"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C89D66]" />
                <span>Buka Semua</span>
              </button>

              <button
                type="button"
                onClick={initFoil}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-serif font-semibold text-[#6B2D39] transition cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Gores Ulang</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default CanvasScratchCard;
