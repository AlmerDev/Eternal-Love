'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Music,
  Camera,
  Clock,
  Settings,
  Lock,
  ArrowUp,
  Volume2,
  Calendar,
  Compass,
  Bookmark,
} from 'lucide-react';
import { KeypadLockScreen } from '../components/lock-screen/KeypadLockScreen';
import { MusicSection } from '../components/music-player/MusicSection';
import { PDKTSection } from '../components/pdkt-gallery/PDKTSection';
import { EternalCountUp } from '../components/countdowns/EternalCountUp';
import { PhotoExhibition3D } from '../components/3d-exhibition/PhotoExhibition3D';
import { CanvasScratchCard } from '../components/scratch-card/CanvasScratchCard';
import { AdminPage } from './admin/page';
import { Song, Photo, CountdownItem, SecretMessage, JourneySettings } from '../types/database';
import { api } from '../lib/supabase';
import {
  INITIAL_SONGS,
  INITIAL_PHOTOS,
  INITIAL_COUNTDOWNS,
  INITIAL_SECRET_MESSAGES,
  INITIAL_JOURNEY_SETTINGS,
} from '../lib/initial-data';

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [autoPlayBgm, setAutoPlayBgm] = useState<boolean>(false);

  // Database loaded state initialized with authentic romantic defaults
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [countdowns, setCountdowns] = useState<CountdownItem[]>(INITIAL_COUNTDOWNS);
  const [secrets, setSecrets] = useState<SecretMessage[]>(INITIAL_SECRET_MESSAGES);
  const [journeySettings, setJourneySettings] = useState<JourneySettings>(INITIAL_JOURNEY_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load scrapbook memories from Supabase / local cache
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, p, c, sec, j] = await Promise.all([
          api.getSongs(),
          api.getPhotos(),
          api.getCountdowns(),
          api.getSecretMessages(),
          api.getJourneySettings(),
        ]);
        setSongs(s);
        setPhotos(p);
        setCountdowns(c);
        setSecrets(sec);
        setJourneySettings(j);
      } catch (err) {
        console.error('Failed to load scrapbook memories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showAdmin]);

  const handleUnlock = () => {
    setIsUnlocked(true);
    setAutoPlayBgm(true);
  };

  const handleLockAgain = () => {
    setIsUnlocked(false);
    setAutoPlayBgm(false);
  };

  // Filter distinct photo collections
  const pdktPhotos = photos.filter((p) => p.category === 'pdkt');
  const exhibitionPhotos = photos.filter((p) => p.category === '3d_exhibition');

  // If Admin panel is opened
  if (showAdmin) {
    return <AdminPage onBackToHome={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF4F0] text-[#4A1E28] relative selection:bg-[#F9E2E7] selection:text-[#4A1E28]">
      {/* Module 1: Keypad Lock Screen Overlay (Passcode: 2909) */}
      {!isUnlocked && <KeypadLockScreen onUnlock={handleUnlock} targetPasscode="2909" />}

      {/* Main Scrapbook Web Application */}
      <div className={`transition-opacity duration-700 ${isUnlocked ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        {/* Scrapbook Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#FFFDF9] border-b-2 border-[#D8A7B1] shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F9E2E7] border-2 border-[#D8A7B1] flex items-center justify-center text-[#6B2D39]">
                <Heart className="w-5 h-5 fill-[#6B2D39]" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-[#4A1E28] tracking-tight">
                  Eternal Love
                </h1>
                <p className="text-[11px] font-cormorant text-[#6B2D39] italic font-semibold">
                  Ciyan &amp; Daffa • 29 September 2025
                </p>
              </div>
            </div>

            {/* Quick Links Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-serif font-semibold text-[#6B2D39]">
              <a href="#music-showcase" className="hover:text-[#4A1E28] transition flex items-center gap-1">
                <Music className="w-3.5 h-3.5" />
                <span>Piringan Hitam</span>
              </a>
              <a href="#pdkt-story" className="hover:text-[#4A1E28] transition flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                <span>Kisah PDKT</span>
              </a>
              <a href="#countdowns-hub" className="hover:text-[#4A1E28] transition flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Detik Kasih</span>
              </a>
              <a href="#exhibition-3d" className="hover:text-[#4A1E28] transition flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C89D66]" />
                <span>Galeri 3D</span>
              </a>
              <a href="#scratch-secret" className="hover:text-[#4A1E28] transition flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Surat Gores</span>
              </a>
            </nav>

            {/* Action Buttons (Admin CMS & Lock) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdmin(true)}
                className="px-3 py-1.5 rounded-full bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-serif font-semibold text-[#6B2D39] flex items-center gap-1.5 transition cursor-pointer"
                title="Buka CMS Admin Panel"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CMS Admin</span>
              </button>

              <button
                type="button"
                onClick={handleLockAgain}
                className="p-2 rounded-full bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39] transition cursor-pointer"
                title="Kunci Kembali Scrapbook"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section: Solid Pink Vintage Scrapbook Cover */}
        <section className="relative px-4 pt-12 pb-16 overflow-hidden">
          <div className="max-w-5xl mx-auto">
            {/* Scrapbook Envelope Card */}
            <div className="relative scrapbook-card-pink p-8 sm:p-14 text-center">
              <div className="scrapbook-tape" />
              <div className="absolute top-4 right-6 scrapbook-pin" />

              {/* Romantic Crest / Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDF9] border border-[#D8A7B1] text-xs font-serif font-semibold text-[#6B2D39] mb-6 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-[#C89D66] fill-[#C89D66]" />
                <span>Solid Pink Vintage Scrapbook Archive</span>
                <Heart className="w-3.5 h-3.5 text-[#C89D66] fill-[#C89D66]" />
              </div>

              {/* Main Scrapbook Title */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-[#4A1E28] tracking-tight leading-none mb-4">
                Eternal Love
              </h1>
              <p className="text-2xl sm:text-3xl font-script text-[#6B2D39] mb-6 font-semibold">
                Kisah Kasih Abadi Ciyan &amp; Daffa
              </p>

              {/* Date Seal */}
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-[#FFFDF9] border-2 border-[#D8A7B1] shadow-[2px_3px_0px_#D8A7B1] mb-8">
                <Calendar className="w-4 h-4 text-[#C89D66]" />
                <span className="font-serif font-bold text-sm text-[#4A1E28] tracking-wide">
                  29 September 2025 &bull; Menuju Selamanya
                </span>
              </div>

              {/* Scrapbook Love Letter Note */}
              <div className="max-w-2xl mx-auto scrapbook-card p-6 bg-[#FFFDF9] text-left relative rotate-[-0.5deg]">
                <div className="absolute -top-3 left-8 h-4 w-20 bg-[#F9E2E7] border border-dashed border-[#D8A7B1] rotate-[-2deg]" />
                <p className="font-cormorant text-base sm:text-lg text-[#4A1E28] leading-relaxed italic font-medium">
                  &ldquo;Di setiap lembaran scrapbook ini, tersimpan ribuan tawa yang pernah kita bagi, lagu-lagu
                  yang memeluk keheningan malam kita, dan janji suci yang kita ikrarkan sejak 29 September.
                  Untuk Ciyan tercinta, ini adalah monumen cinta kita yang abadi.&rdquo;
                </p>
                <div className="mt-4 pt-3 border-t border-dashed border-[#D8A7B1] flex justify-between items-center">
                  <span className="font-script text-xl text-[#6B2D39] font-bold">
                    Dengan segenap cinta, Daffa
                  </span>
                  <div className="flex items-center gap-1 text-[#C89D66]">
                    <Sparkles className="w-4 h-4" />
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Modules Container */}
        <div className="max-w-6xl mx-auto px-4">
          {/* Module 4: Eternal Count-Up & Countdown Hub */}
          <EternalCountUp
            countdowns={countdowns}
            journeySettings={journeySettings}
            anniversaryStartDate={journeySettings.startDate}
          />

          {/* Module 2: Pink Vintage Vinyl Music Showcase */}
          <MusicSection songs={songs} autoPlayBgm={autoPlayBgm} />

          {/* Module 3: Clean PDKT Storytelling Gallery (Only PDKT Photos) */}
          <PDKTSection photos={pdktPhotos} />

          {/* Module 5: Three.js 3D Photo Exhibition (Only 3D Photos) */}
          <PhotoExhibition3D photos={exhibitionPhotos} />

          {/* Module 6: Canvas Scratch Card */}
          <CanvasScratchCard messages={secrets} />
        </div>

        {/* Scrapbook Romantic Footer */}
        <footer className="mt-20 border-t-2 border-[#D8A7B1] bg-[#FFFDF9] py-12 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#F9E2E7] border-2 border-[#D8A7B1] flex items-center justify-center mx-auto mb-4 text-[#6B2D39]">
              <Heart className="w-6 h-6 fill-[#6B2D39]" />
            </div>

            <h3 className="text-2xl font-serif font-bold text-[#4A1E28] mb-1">
              Eternal Love &bull; Ciyan &amp; Daffa
            </h3>
            <p className="text-sm font-cormorant text-[#6B2D39] italic font-semibold mb-6">
              Diabadikan dengan penuh cinta sejak 29 September 2025 hingga akhir masa.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-serif text-[#6B2D39]">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Kembali ke Atas</span>
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setShowAdmin(true)}
                className="hover:underline flex items-center gap-1 cursor-pointer font-semibold text-[#4A1E28]"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>CMS Admin Panel</span>
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={handleLockAgain}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Kunci Scrapbook (2909)</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
