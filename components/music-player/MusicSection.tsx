import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc3,
  Heart,
  Music,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { Song, SongCategory } from '../../types/database';
import { VinylSongCard } from './VinylSongCard';
import { FALLBACK_AUDIO, romanticSynth } from '../../lib/romantic-audio';

interface MusicSectionProps {
  songs: Song[];
  autoPlayBgm?: boolean;
}

export const MusicSection: React.FC<MusicSectionProps> = ({ songs, autoPlayBgm = false }) => {
  const [activeCategory, setActiveCategory] = useState<SongCategory | 'all'>('all');
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [usingSynthFallback, setUsingSynthFallback] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Grouped lists based on user specification
  const currentSong = songs[currentSongIndex] || songs[0];

  // 1. Music BGM & Lagu Abadi Kita (digabung)
  const bgmAndAbadiSongs = songs.filter(
    (s) => s.category === 'bgm' || s.category === 'abadi'
  );
  // 2. Lagu Favorit Daffa
  const daffaSongs = songs.filter((s) => s.category === 'daffa');
  // 3. Lagu Favorit Ciyan
  const ciyanSongs = songs.filter((s) => s.category === 'ciyan');
  // 4. Lagu lainnya jika ada
  const otherSongs = songs.filter(
    (s) => !['bgm', 'abadi', 'daffa', 'ciyan'].includes(s.category)
  );

  const handleSelectSong = (selected: Song) => {
    const idx = songs.findIndex((s) => s.id === selected.id);
    if (idx !== -1) {
      setCurrentSongIndex(idx);
      setTimeout(() => {
        startPlayback(songs[idx]);
      }, 100);
    }
  };

  // Safe playback runner
  const startPlayback = (targetSong?: Song) => {
    const songToPlay = targetSong || currentSong;
    if (!songToPlay) return;

    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setUsingSynthFallback(false);
          romanticSynth.stop();
        })
        .catch(() => {
          // If browser policy blocks media or source fails, seamlessly activate the romantic acoustic synth
          romanticSynth.play(songToPlay.category, isMuted ? 0 : volume);
          setIsPlaying(true);
          setUsingSynthFallback(true);
        });
    } else {
      romanticSynth.play(songToPlay.category, isMuted ? 0 : volume);
      setIsPlaying(true);
      setUsingSynthFallback(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    romanticSynth.stop();
    setIsPlaying(false);
  };

  // Auto-play BGM upon unlock if triggered
  useEffect(() => {
    if (autoPlayBgm && songs.length > 0) {
      const bgmIndex = songs.findIndex((s) => s.category === 'bgm');
      const targetIndex = bgmIndex !== -1 ? bgmIndex : 0;
      setCurrentSongIndex(targetIndex);

      const timer = setTimeout(() => {
        startPlayback(songs[targetIndex]);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [autoPlayBgm, songs]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      romanticSynth.stop();
    };
  }, []);

  // Audio event listeners
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    // Intercept and prevent unhandled media loading errors from bubbling
    e.preventDefault();
    e.stopPropagation();

    // Fall back to generated offline acoustic audio track if external URL fails
    if (audioRef.current && currentSong) {
      const fallback = FALLBACK_AUDIO[currentSong.category] || FALLBACK_AUDIO.bgm;
      if (audioRef.current.src !== fallback) {
        audioRef.current.src = fallback;
        if (isPlaying) {
          audioRef.current.play().catch(() => {
            romanticSynth.play(currentSong.category, isMuted ? 0 : volume);
          });
        }
      } else {
        // If data URL also encounters any restriction, play via Web Audio synth
        if (isPlaying) {
          romanticSynth.play(currentSong.category, isMuted ? 0 : volume);
        }
      }
    }
  };

  const handleTogglePlay = (targetSong?: Song) => {
    if (targetSong && (!currentSong || targetSong.id !== currentSong.id)) {
      const idx = songs.findIndex((s) => s.id === targetSong.id);
      if (idx !== -1) {
        setCurrentSongIndex(idx);
        setTimeout(() => {
          startPlayback(songs[idx]);
        }, 120);
        return;
      }
    }

    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    const nextIdx = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIdx);
    setTimeout(() => {
      startPlayback(songs[nextIdx]);
    }, 120);
  };

  const handlePrev = () => {
    if (songs.length === 0) return;
    const prevIdx = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIdx);
    setTimeout(() => {
      startPlayback(songs[prevIdx]);
    }, 120);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current && !usingSynthFallback) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const effectiveVol = isMuted ? 0 : val;
    if (audioRef.current) {
      audioRef.current.volume = effectiveVol;
      setIsMuted(val === 0);
    }
    romanticSynth.setVolume(effectiveVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      const nextVol = volume || 0.8;
      if (audioRef.current) audioRef.current.volume = nextVol;
      romanticSynth.setVolume(nextVol);
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.volume = 0;
      romanticSynth.setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section id="music-showcase" className="relative my-12 scroll-mt-24">
      {/* Resilient Audio Element with Guaranteed Fallback */}
      {currentSong && (
        <audio
          ref={audioRef}
          key={currentSong.id}
          src={currentSong.audio_url || FALLBACK_AUDIO[currentSong.category] || FALLBACK_AUDIO.bgm}
          preload="auto"
          onError={handleAudioError}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] mb-3">
          <Disc3 className="w-4 h-4 text-[#C89D66]" />
          <span>Vintage Vinyl Music Showcase</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#4A1E28]">
          Melodi Cinta Ciyan &amp; Daffa
        </h2>
        <p className="mt-2 text-base font-cormorant text-[#6B2D39] italic font-medium">
          Setiap piringan hitam menyimpan untaian nada yang menemani detak jantung dan pelukan hangat kita.
        </p>
      </div>

      {/* Featured Master Vinyl Turntable Player */}
      {currentSong && (
        <div className="scrapbook-card-pink p-6 sm:p-8 mb-10 max-w-4xl mx-auto relative overflow-hidden">
          <div className="scrapbook-tape" />
          <div className="absolute top-3 right-4 scrapbook-pin" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Spinning Vinyl Center Showcase */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-[#181315] border-4 border-[#2A2325] shadow-2xl flex items-center justify-center">
                {/* Grooves */}
                <div className="absolute inset-3 rounded-full border border-[#3A3235] opacity-60" />
                <div className="absolute inset-7 rounded-full border border-[#3A3235] opacity-60" />
                <div className="absolute inset-11 rounded-full border border-[#3A3235] opacity-60" />

                {/* Animated Rotating Center with Vinyl Photo */}
                <div
                  className={`w-20 h-20 rounded-full border-2 border-[#D8A7B1] overflow-hidden bg-[#FFFDF9] flex items-center justify-center relative shadow-inner ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '4s' }}
                >
                  <img
                    src={currentSong.vinyl_photo_url || currentSong.cover_url}
                    alt="Center Sticker"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute w-4 h-4 rounded-full bg-[#181315] border border-[#D8A7B1]" />
                </div>
              </div>
            </div>

            {/* Turntable Control Panel */}
            <div className="md:col-span-8 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF4F0] border border-[#D8A7B1] text-[#6B2D39]">
                  {usingSynthFallback
                    ? 'Memutar Melodi Akustik Romantis'
                    : 'Sedang Diputar di Pemutar Piringan Hitam'}
                </span>
                <span className="text-xs font-mono font-bold text-[#4A1E28]">
                  {formatTime(currentTime)} / {formatTime(duration || 225)}
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-[#4A1E28] mb-1">
                {currentSong.title}
              </h3>
              <p className="text-sm font-cormorant font-semibold text-[#6B2D39] mb-4">
                {currentSong.artist}
              </p>

              {/* Seekbar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 225}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-[#FAF4F0] rounded-lg appearance-none cursor-pointer accent-[#6B2D39] border border-[#D8A7B1]"
                />
              </div>

              {/* Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="w-10 h-10 rounded-full bg-[#FAF4F0] hover:bg-[#FFFDF9] border-2 border-[#D8A7B1] text-[#4A1E28] flex items-center justify-center cursor-pointer transition shadow-[1px_2px_0px_#D8A7B1]"
                    aria-label="Lagu Sebelumnya"
                  >
                    <SkipBack className="w-4 h-4 text-[#6B2D39]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTogglePlay()}
                    className="w-13 h-13 rounded-full bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] border-2 border-[#FAF4F0] flex items-center justify-center cursor-pointer transition transform active:scale-95 shadow-[2px_4px_0px_#4A1E28]"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-10 h-10 rounded-full bg-[#FAF4F0] hover:bg-[#FFFDF9] border-2 border-[#D8A7B1] text-[#4A1E28] flex items-center justify-center cursor-pointer transition shadow-[1px_2px_0px_#D8A7B1]"
                    aria-label="Lagu Selanjutnya"
                  >
                    <SkipForward className="w-4 h-4 text-[#6B2D39]" />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2 bg-[#FAF4F0] px-3 py-1.5 rounded-full border border-[#D8A7B1]">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-[#6B2D39] hover:text-[#4A1E28] cursor-pointer"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 sm:w-24 h-1.5 bg-[#FFFDF9] rounded-lg appearance-none cursor-pointer accent-[#6B2D39]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border-2 transition cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28] shadow-[2px_3px_0px_#4A1E28]'
              : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
          }`}
        >
          Semua Playlist ({songs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('bgm')}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border-2 transition cursor-pointer ${
            activeCategory === 'bgm' || activeCategory === 'abadi'
              ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28] shadow-[2px_3px_0px_#4A1E28]'
              : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C89D66]" />
          <span>BGM &amp; Lagu Abadi ({bgmAndAbadiSongs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('daffa')}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border-2 transition cursor-pointer ${
            activeCategory === 'daffa'
              ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28] shadow-[2px_3px_0px_#4A1E28]'
              : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
          }`}
        >
          <Disc3 className="w-3.5 h-3.5 text-[#C89D66]" />
          <span>Favorit Daffa ({daffaSongs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('ciyan')}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border-2 transition cursor-pointer ${
            activeCategory === 'ciyan'
              ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28] shadow-[2px_3px_0px_#4A1E28]'
              : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>Favorit Ciyan ({ciyanSongs.length})</span>
        </button>
      </div>

      {/* SEPARATED COLUMNS / ROWS */}

      {/* 1. Music BGM dan Lagu Abadi Kita (DIGABUNG) */}
      {(activeCategory === 'all' || activeCategory === 'bgm' || activeCategory === 'abadi') && bgmAndAbadiSongs.length > 0 && (
        <div className="mb-14">
          {/* Header Baris 1 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-serif font-bold text-[#6B2D39] mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C89D66] fill-[#C89D66]" />
              <span>BGM Kenangan &amp; Lagu Abadi Kita</span>
              <Sparkles className="w-3.5 h-3.5 text-[#C89D66] fill-[#C89D66]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#4A1E28]">
              Melodi Pengikat Janji &amp; Lagu Abadi
            </h3>
            <p className="text-xs font-cormorant italic text-[#6B2D39] font-semibold mt-1 max-w-lg mx-auto">
              Lagu pengikat hati dan latar romantis yang mengalun mengiringi lembar kisah Ciyan &amp; Daffa
            </p>
          </div>

          {/* Cards Centered (Tengah) */}
          <div className="flex flex-wrap justify-center items-stretch gap-6 max-w-5xl mx-auto">
            {bgmAndAbadiSongs.map((song) => (
              <div
                key={song.id}
                className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-16px)] max-w-sm flex justify-center"
              >
                <div className="w-full">
                  <VinylSongCard
                    song={song}
                    isPlaying={isPlaying}
                    isCurrent={currentSong?.id === song.id}
                    onSelect={handleSelectSong}
                    onTogglePlay={handleTogglePlay}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Lagu Favorite nya si Daffa (DI BAWAHNYA) */}
      {(activeCategory === 'all' || activeCategory === 'daffa') && daffaSongs.length > 0 && (
        <div className="mb-14">
          {/* Header Baris 2 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif font-bold text-[#6B2D39] mb-2 shadow-xs">
              <Disc3 className="w-3.5 h-3.5 text-[#C89D66]" />
              <span>Lagu Favorit Daffa</span>
              <Disc3 className="w-3.5 h-3.5 text-[#C89D66]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#4A1E28]">
              Lagu-Lagu Favorit Pilihan Daffa
            </h3>
            <p className="text-xs font-cormorant italic text-[#6B2D39] font-semibold mt-1 max-w-lg mx-auto">
              Koleksi melodi yang selalu menemani dan mengingatkan Daffa pada bidadari tercintanya
            </p>
          </div>

          {/* Cards Centered (Tengah) */}
          <div className="flex flex-wrap justify-center items-stretch gap-6 max-w-6xl mx-auto">
            {daffaSongs.map((song) => (
              <div
                key={song.id}
                className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-16px)] max-w-sm flex justify-center"
              >
                <div className="w-full">
                  <VinylSongCard
                    song={song}
                    isPlaying={isPlaying}
                    isCurrent={currentSong?.id === song.id}
                    onSelect={handleSelectSong}
                    onTogglePlay={handleTogglePlay}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Lagu Favorite nya si Ciyan (DI BAWAHNYA LAGI) */}
      {(activeCategory === 'all' || activeCategory === 'ciyan') && ciyanSongs.length > 0 && (
        <div className="mb-8">
          {/* Header Baris 3 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-serif font-bold text-[#6B2D39] mb-2 shadow-xs">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Lagu Favorit Ciyan</span>
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#4A1E28]">
              Lagu-Lagu Favorit Kesukaan Ciyan
            </h3>
            <p className="text-xs font-cormorant italic text-[#6B2D39] font-semibold mt-1 max-w-lg mx-auto">
              Lantunan nada manis nan syahdu pilihan bidadari terkasih yang selalu membawa kehangatan
            </p>
          </div>

          {/* Cards Centered (Tengah) */}
          <div className="flex flex-wrap justify-center items-stretch gap-6 max-w-6xl mx-auto">
            {ciyanSongs.map((song) => (
              <div
                key={song.id}
                className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-16px)] max-w-sm flex justify-center"
              >
                <div className="w-full">
                  <VinylSongCard
                    song={song}
                    isPlaying={isPlaying}
                    isCurrent={currentSong?.id === song.id}
                    onSelect={handleSelectSong}
                    onTogglePlay={handleTogglePlay}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lagu Lainnya jika ada */}
      {otherSongs.length > 0 && activeCategory === 'all' && (
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif font-bold text-[#6B2D39] mb-2 shadow-xs">
              <Music className="w-3.5 h-3.5 text-[#C89D66]" />
              <span>Koleksi Lagu Lainnya</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#4A1E28]">
              Kenangan Musik Tambahan
            </h3>
          </div>

          <div className="flex flex-wrap justify-center items-stretch gap-6 max-w-6xl mx-auto">
            {otherSongs.map((song) => (
              <div
                key={song.id}
                className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-16px)] max-w-sm flex justify-center"
              >
                <div className="w-full">
                  <VinylSongCard
                    song={song}
                    isPlaying={isPlaying}
                    isCurrent={currentSong?.id === song.id}
                    onSelect={handleSelectSong}
                    onTogglePlay={handleTogglePlay}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
export default MusicSection;
