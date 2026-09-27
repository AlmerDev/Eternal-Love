import React from 'react';
import { Play, Pause, Disc, Heart, Music, Sparkles } from 'lucide-react';
import { Song } from '../../types/database';

interface VinylSongCardProps {
  song: Song;
  isPlaying: boolean;
  isCurrent: boolean;
  onSelect: (song: Song) => void;
  onTogglePlay: (song: Song) => void;
}

export const VinylSongCard: React.FC<VinylSongCardProps> = ({
  song,
  isPlaying,
  isCurrent,
  onSelect,
  onTogglePlay,
}) => {
  const activeAndPlaying = isCurrent && isPlaying;

  const getCategoryBadge = () => {
    switch (song.category) {
      case 'bgm':
        return { label: 'BGM Kenangan', color: 'bg-[#F9E2E7] text-[#6B2D39] border-[#D8A7B1]' };
      case 'abadi':
        return { label: 'Lagu Abadi Kita', color: 'bg-[#FAF4F0] text-[#C89D66] border-[#C89D66]' };
      case 'ciyan':
        return { label: 'Favorit Ciyan', color: 'bg-[#F9E2E7] text-[#4A1E28] border-[#D8A7B1]' };
      case 'daffa':
        return { label: 'Favorit Daffa', color: 'bg-[#FAF4F0] text-[#6B2D39] border-[#D8A7B1]' };
      default:
        return { label: 'Scrapbook Track', color: 'bg-[#FAF4F0] text-[#6B2D39] border-[#D8A7B1]' };
    }
  };

  const badge = getCategoryBadge();

  return (
    <div
      onClick={() => onSelect(song)}
      className={`group relative scrapbook-card p-4 transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
        isCurrent ? 'ring-2 ring-[#C89D66] shadow-[4px_8px_0px_0px_#C89D66]' : ''
      }`}
    >
      {/* Little tape decor */}
      <div className="absolute -top-3 left-6 h-5 w-16 bg-[#F9E2E7] border border-dashed border-[#D8A7B1] rotate-[-2deg] z-20 pointer-events-none" />

      {/* Main Vinyl Container with Disc Ejection Effect */}
      <div className="relative flex items-center justify-center h-48 sm:h-52 overflow-hidden rounded-xl bg-[#FAF4F0] border border-[#D8A7B1] p-3">
        {/* Sleeve & Vinyl Disc Combined Unit (Positioned relative to each other for 100% responsive consistency) */}
        <div className="relative flex items-center justify-center -translate-x-3 sm:-translate-x-4">
          {/* Vinyl Disc that slides out to the right from behind the cover sleeve */}
          <div
            className={`absolute top-0 left-0 w-36 h-36 sm:w-40 sm:h-40 transition-transform duration-500 ease-out z-0 pointer-events-none ${
              activeAndPlaying
                ? 'translate-x-12 sm:translate-x-14'
                : 'group-hover:translate-x-10 sm:group-hover:translate-x-12 translate-x-5 sm:translate-x-6'
            }`}
          >
            {/* Spinning Vinyl Disc Body */}
            <div
              className={`w-full h-full rounded-full bg-[#181315] border-4 border-[#2A2325] shadow-xl flex items-center justify-center ${
                activeAndPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '3.5s' }}
            >
              {/* Vinyl Grooves concentric rings */}
              <div className="absolute inset-2 rounded-full border border-[#3A3235] opacity-60" />
              <div className="absolute inset-5 rounded-full border border-[#3A3235] opacity-60" />
              <div className="absolute inset-8 rounded-full border border-[#3A3235] opacity-60" />

              {/* Vinyl Center Sticker with CUSTOM VINYL PHOTO */}
              <div className="relative w-14 h-14 rounded-full border-2 border-[#D8A7B1] overflow-hidden bg-[#FAF4F0] flex items-center justify-center shadow-inner">
                {song.vinyl_photo_url ? (
                  <img
                    src={song.vinyl_photo_url}
                    alt={`${song.title} Vinyl Center`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Disc className="w-8 h-8 text-[#6B2D39]" />
                )}
                {/* Center Spindle Hole */}
                <div className="absolute w-3.5 h-3.5 rounded-full bg-[#181315] border border-[#D8A7B1]" />
              </div>
            </div>
          </div>

          {/* Album Cover Frame (Sits in front of the disc) */}
          <div className="relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-lg overflow-hidden border-2 border-[#D8A7B1] bg-[#FFFDF9] shadow-md group-hover:scale-[1.02] transition-transform duration-300">
            <img
              src={song.cover_url}
              alt={song.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Play / Pause Overlay Button on Cover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay(song);
              }}
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#FFFDF9] border-2 border-[#D8A7B1] text-[#4A1E28] flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-90 hover:bg-[#F9E2E7] cursor-pointer"
              aria-label={activeAndPlaying ? 'Pause' : 'Play'}
            >
              {activeAndPlaying ? (
                <Pause className="w-5 h-5 text-[#6B2D39] fill-[#6B2D39]" />
              ) : (
                <Play className="w-5 h-5 text-[#6B2D39] fill-[#6B2D39] translate-x-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Track Metadata Card Footer */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
          >
            {song.category === 'abadi' && <Sparkles className="w-3 h-3 text-[#C89D66]" />}
            {song.category === 'bgm' && <Music className="w-3 h-3 text-[#6B2D39]" />}
            {(song.category === 'ciyan' || song.category === 'daffa') && (
              <Heart className="w-3 h-3 text-[#6B2D39]" />
            )}
            <span>{badge.label}</span>
          </span>
          {song.duration && (
            <span className="text-xs font-mono text-[#6B2D39] font-medium">{song.duration}</span>
          )}
        </div>

        <h3 className="font-serif font-bold text-base text-[#4A1E28] truncate" title={song.title}>
          {song.title}
        </h3>
        <p className="text-xs font-cormorant text-[#6B2D39] font-semibold truncate mt-0.5">
          {song.artist}
        </p>

        {song.lyrics && (
          <p className="mt-2 text-xs font-script text-[#4A1E28]/80 line-clamp-1 italic bg-[#FAF4F0] p-1.5 rounded border border-dashed border-[#D8A7B1]">
            &ldquo;{song.lyrics}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
};
export default VinylSongCard;
