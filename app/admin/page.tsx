import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Music,
  Camera,
  Clock,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Image as ImageIcon,
  Disc,
  RotateCcw,
  ArrowLeft,
  Heart,
  Calendar,
} from 'lucide-react';
import { Song, Photo, CountdownItem, SecretMessage, SongCategory, PhotoCategory, JourneySettings } from '../../types/database';
import { api, isSupabaseConfigured } from '../../lib/supabase';
import {
  INITIAL_SONGS,
  INITIAL_PHOTOS,
  INITIAL_COUNTDOWNS,
  INITIAL_SECRET_MESSAGES,
  INITIAL_JOURNEY_SETTINGS,
} from '../../lib/initial-data';

interface AdminPageProps {
  onBackToHome?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>('');
  const [adminPinError, setAdminPinError] = useState<string>('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'songs' | 'pdkt' | '3d_photos' | 'countdowns' | 'journey' | 'secrets'
  >('songs');

  // Data states
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [countdowns, setCountdowns] = useState<CountdownItem[]>(INITIAL_COUNTDOWNS);
  const [secrets, setSecrets] = useState<SecretMessage[]>(INITIAL_SECRET_MESSAGES);
  const [journey, setJourney] = useState<JourneySettings>(INITIAL_JOURNEY_SETTINGS);
  const [journeyForm, setJourneyForm] = useState<JourneySettings>(INITIAL_JOURNEY_SETTINGS);
  const [savingJourney, setSavingJourney] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string>('');

  // Separated photo arrays
  const pdktPhotos = photos.filter((p) => p.category === 'pdkt');
  const exhibitionPhotos = photos.filter((p) => p.category === '3d_exhibition');

  // Edit / Add Modal States
  const [editingSong, setEditingSong] = useState<Partial<Song> | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Partial<Photo> | null>(null);
  const [editingCountdown, setEditingCountdown] = useState<Partial<CountdownItem> | null>(null);
  const [editingSecret, setEditingSecret] = useState<Partial<SecretMessage> | null>(null);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sData, pData, cData, secData, jData] = await Promise.all([
        api.getSongs(),
        api.getPhotos(),
        api.getCountdowns(),
        api.getSecretMessages(),
        api.getJourneySettings(),
      ]);
      setSongs(sData);
      setPhotos(pData);
      setCountdowns(cData);
      setSecrets(secData);
      setJourney(jData);
      setJourneyForm(jData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '2909' || adminPin === 'admin2909') {
      setIsAdminAuthenticated(true);
      setAdminPinError('');
    } else {
      setAdminPinError('PIN Admin Salah! Gunakan kode tanggal 2909');
    }
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  // -------------------------------------------------------------
  // File Upload Handlers (Supabase Storage 'media' bucket)
  // -------------------------------------------------------------
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'cover_url' | 'vinyl_photo_url' | 'audio_url' | 'image_url',
    folder: 'covers' | 'vinyl_stickers' | 'photos' | 'audio'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const publicUrl = await api.uploadMediaFile(file, folder);
      if (targetField === 'cover_url' && editingSong) {
        setEditingSong({ ...editingSong, cover_url: publicUrl });
      } else if (targetField === 'vinyl_photo_url' && editingSong) {
        setEditingSong({ ...editingSong, vinyl_photo_url: publicUrl });
      } else if (targetField === 'audio_url' && editingSong) {
        setEditingSong({ ...editingSong, audio_url: publicUrl });
      } else if (targetField === 'image_url' && editingPhoto) {
        setEditingPhoto({ ...editingPhoto, image_url: publicUrl });
      }
      showNotification(`File "${file.name}" berhasil diunggah!`);
    } catch (err) {
      console.error('Upload failed:', err);
      showNotification('Gagal mengunggah file. Silakan coba lagi.');
    } finally {
      setUploadingFile(false);
    }
  };

  // -------------------------------------------------------------
  // Save & Delete Handlers
  // -------------------------------------------------------------
  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong || !editingSong.title || !editingSong.audio_url) return;

    const newSong: Song = {
      id: editingSong.id || `song-${Date.now()}`,
      title: editingSong.title,
      artist: editingSong.artist || 'Ciyan & Daffa',
      category: (editingSong.category as SongCategory) || 'ciyan',
      audio_url: editingSong.audio_url,
      cover_url:
        editingSong.cover_url ||
        'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80',
      vinyl_photo_url:
        editingSong.vinyl_photo_url ||
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&auto=format&fit=crop&q=80',
      lyrics: editingSong.lyrics || '',
      duration: editingSong.duration || '3:30',
      order_index: editingSong.order_index ?? songs.length,
    };

    await api.saveSong(newSong);
    await loadAllData();
    setEditingSong(null);
    showNotification('Lagu berhasil disimpan ke database!');
  };

  const handleDeleteSong = async (id: string) => {
    if (confirm('Yakin ingin menghapus lagu ini dari scrapbook?')) {
      await api.deleteSong(id);
      await loadAllData();
      showNotification('Lagu berhasil dihapus.');
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto || !editingPhoto.title || !editingPhoto.image_url) return;

    const newPhoto: Photo = {
      id: editingPhoto.id || `photo-${Date.now()}`,
      title: editingPhoto.title,
      caption: editingPhoto.caption || '',
      date: editingPhoto.date || '29 September',
      location: editingPhoto.location || '',
      image_url: editingPhoto.image_url,
      category: (editingPhoto.category as PhotoCategory) || 'pdkt',
      rotation: editingPhoto.rotation ?? 0,
      order_index: editingPhoto.order_index ?? photos.length,
    };

    await api.savePhoto(newPhoto);
    await loadAllData();
    setEditingPhoto(null);
    showNotification('Foto memori berhasil disimpan!');
  };

  const handleDeletePhoto = async (id: string) => {
    if (confirm('Hapus foto ini dari galeri?')) {
      await api.deletePhoto(id);
      await loadAllData();
      showNotification('Foto dihapus.');
    }
  };

  const handleSaveCountdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCountdown || !editingCountdown.title || !editingCountdown.target_date) return;

    const newCd: CountdownItem = {
      id: editingCountdown.id || `cd-${Date.now()}`,
      title: editingCountdown.title,
      target_date: editingCountdown.target_date,
      category: editingCountdown.category || 'custom',
      description: editingCountdown.description || '',
      badge: editingCountdown.badge || '',
    };

    await api.saveCountdown(newCd);
    await loadAllData();
    setEditingCountdown(null);
    showNotification('Countdown berhasil diperbarui!');
  };

  const handleDeleteCountdown = async (id: string) => {
    if (confirm('Apakah kamu yakin ingin menghapus momen countdown ini?')) {
      await api.deleteCountdown(id);
      await loadAllData();
      showNotification('Countdown berhasil dihapus!');
    }
  };

  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSecret || !editingSecret.title || !editingSecret.message) return;

    const newSec: SecretMessage = {
      id: editingSecret.id || `secret-${Date.now()}`,
      title: editingSecret.title,
      message: editingSecret.message,
      author: editingSecret.author || 'Daffa',
      scratch_percent_required: editingSecret.scratch_percent_required || 40,
    };

    await api.saveSecretMessage(newSec);
    await loadAllData();
    setEditingSecret(null);
    showNotification('Surat rahasia berhasil disimpan!');
  };

  const handleSaveJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJourney(true);
    try {
      const saved = await api.saveJourneySettings(journeyForm);
      setJourney(saved);
      showNotification('Pengaturan perjalanan sejak berhasil disimpan!');
    } catch (err) {
      console.error('Error saving journey:', err);
      showNotification('Gagal menyimpan perjalanan sejak!');
    } finally {
      setSavingJourney(false);
    }
  };

  // -------------------------------------------------------------
  // Admin Login Shield Screen
  // -------------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF4F0]">
        <div className="w-full max-w-md scrapbook-card p-6 sm:p-8 bg-[#FFFDF9] text-[#4A1E28]">
          <div className="scrapbook-tape" />

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#F9E2E7] border-2 border-[#D8A7B1] text-[#6B2D39] mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#4A1E28]">
              Panel Admin Scrapbook
            </h1>
            <p className="text-xs font-cormorant text-[#6B2D39] italic font-semibold mt-1">
              CMS Manajemen Memori Ciyan &amp; Daffa
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-serif font-semibold text-[#6B2D39] mb-1">
                Masukkan PIN Rahasia Admin
              </label>
              <input
                type="password"
                maxLength={8}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Kode PIN"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF4F0] border-2 border-[#D8A7B1] text-[#4A1E28] font-mono text-center tracking-widest text-lg focus:outline-none focus:border-[#6B2D39]"
              />
              {adminPinError && (
                <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {adminPinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] font-serif font-semibold text-sm transition shadow-[2px_3px_0px_#4A1E28] flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Buka Panel Admin</span>
            </button>

            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full py-2 text-xs font-serif text-[#6B2D39] hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Scrapbook</span>
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF4F0] text-[#4A1E28] pb-16">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-[#FFFDF9] border-2 border-[#D8A7B1] text-[#6B2D39] px-4 py-2.5 rounded-xl shadow-xl text-xs font-serif font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <header className="bg-[#FFFDF9] border-b-2 border-[#D8A7B1] px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="p-2 rounded-xl bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39] cursor-pointer"
                title="Kembali ke Scrapbook"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-serif font-bold text-[#4A1E28]">
                Eternal Love CMS Panel
              </h1>
              <p className="text-[11px] font-cormorant text-[#6B2D39] italic font-semibold">
                Pengelolaan Piringan Hitam, Galeri Foto PDKT, 3D Exhibition, Countdown, &amp; Surat Rahasia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${isSupabaseConfigured()
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
              title={
                isSupabaseConfigured()
                  ? 'Koneksi Supabase aktif via file .env'
                  : 'Atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env untuk cloud sync'
              }
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {isSupabaseConfigured() ? 'Supabase Terhubung (.env)' : 'Mode Local Storage (Offline)'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                api.resetToDefaults();
                loadAllData();
                showNotification('Data dikembalikan ke default scrapbook romantis!');
              }}
              className="px-3 py-1 rounded-full bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-serif text-[#6B2D39] flex items-center gap-1 cursor-pointer"
              title="Reset ke Template Romantis Bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Tab Navigation */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#D8A7B1] pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('songs')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-semibold border-2 transition cursor-pointer ${activeTab === 'songs'
              ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28]'
              : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
              }`}
          >
            <Music className="w-4 h-4" />
            <span>Piringan Hitam &amp; Lagu ({songs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pdkt')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-semibold border-2 transition cursor-pointer ${activeTab === 'pdkt'
              ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28]'
              : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
              }`}
          >
            <Camera className="w-4 h-4" />
            <span>Foto Kenangan PDKT ({pdktPhotos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('3d_photos')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-semibold border-2 transition cursor-pointer ${activeTab === '3d_photos'
              ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28]'
              : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
              }`}
          >
            <Sparkles className="w-4 h-4 text-[#C89D66]" />
            <span>Foto 3D Exhibition ({exhibitionPhotos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('countdowns')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-semibold border-2 transition cursor-pointer ${activeTab === 'countdowns'
              ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28]'
              : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
              }`}
          >
            <Clock className="w-4 h-4" />
            <span>Countdowns &amp; Hari Spesial ({countdowns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('journey')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-semibold border-2 transition cursor-pointer ${activeTab === 'journey'
              ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28]'
              : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
              }`}
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Perjalanan Sejak (Waktu Jadian)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('secrets')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-semibold border-2 transition cursor-pointer ${activeTab === 'secrets'
              ? 'bg-[#6B2D39] text-[#FFFDF9] border-[#4A1E28]'
              : 'bg-[#FFFDF9] text-[#6B2D39] border-[#D8A7B1] hover:bg-[#F9E2E7]'
              }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Surat Gores Rahasia ({secrets.length})</span>
          </button>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: SONGS MANAGEMENT
            ------------------------------------------------------------- */}
        {activeTab === 'songs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold text-[#4A1E28]">
                Daftar Lagu &amp; Piringan Hitam
              </h2>
              <button
                type="button"
                onClick={() =>
                  setEditingSong({
                    title: '',
                    artist: '',
                    category: 'ciyan',
                    audio_url: '',
                    cover_url: '',
                    vinyl_photo_url: '',
                    lyrics: '',
                    duration: '3:30',
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] text-xs font-serif font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lagu Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {songs.map((s) => (
                <div key={s.id} className="scrapbook-card p-4 flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#D8A7B1] flex-shrink-0 bg-[#FAF4F0]">
                    <img src={s.cover_url} alt={s.title} className="w-full h-full object-cover" />
                    {/* Vinyl photo mini badge */}
                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full border border-[#D8A7B1] overflow-hidden bg-black">
                      <img src={s.vinyl_photo_url} alt="Vinyl Center" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39]">
                      Kategori: {s.category.toUpperCase()}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#4A1E28] truncate mt-1">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#6B2D39] truncate">{s.artist}</p>
                    <p className="text-[11px] font-mono text-[#6B2D39]/80 truncate mt-1">
                      MP3: {s.audio_url}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSong(s)}
                      className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39] cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSong(s.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-300 text-red-600 cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Song Edit/Add Modal */}
            {editingSong && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A1E28]/60 overflow-y-auto">
                <div className="relative w-full max-w-xl scrapbook-card p-6 bg-[#FFFDF9] max-h-[90vh] overflow-y-auto">
                  <div className="scrapbook-tape" />
                  <h3 className="text-xl font-serif font-bold text-[#4A1E28] mb-4">
                    {editingSong.id ? 'Edit Data Lagu & Piringan Hitam' : 'Tambah Lagu Baru'}
                  </h3>

                  <form onSubmit={handleSaveSong} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                          Judul Lagu *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingSong.title || ''}
                          onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                          Penyanyi / Artist *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingSong.artist || ''}
                          onChange={(e) => setEditingSong({ ...editingSong, artist: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                          Kategori Showcase
                        </label>
                        <select
                          value={editingSong.category || 'ciyan'}
                          onChange={(e) =>
                            setEditingSong({
                              ...editingSong,
                              category: e.target.value as SongCategory,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-medium"
                        >
                          <option value="bgm">Ambient BGM (Auto-play pasca unlock)</option>
                          <option value="abadi">Lagu Abadi Kita</option>
                          <option value="ciyan">Favorit Ciyan (3 Lagu)</option>
                          <option value="daffa">Favorit Daffa (3 Lagu)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                          Durasi (Contoh: 3:45)
                        </label>
                        <input
                          type="text"
                          value={editingSong.duration || ''}
                          onChange={(e) => setEditingSong({ ...editingSong, duration: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                        />
                      </div>
                    </div>

                    {/* Audio URL & Direct File Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Audio URL (MP3) *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editingSong.audio_url || ''}
                          onChange={(e) => setEditingSong({ ...editingSong, audio_url: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                          placeholder="https://... atau unggah MP3"
                        />
                        <label className="px-3 py-2 rounded-lg bg-[#F9E2E7] hover:bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] flex items-center gap-1 cursor-pointer flex-shrink-0">
                          <FileAudio className="w-3.5 h-3.5" />
                          <span>Upload MP3</span>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleFileUpload(e, 'audio_url', 'audio')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Album Cover URL & Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Foto Cover Album *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editingSong.cover_url || ''}
                          onChange={(e) => setEditingSong({ ...editingSong, cover_url: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                          placeholder="URL gambar cover"
                        />
                        <label className="px-3 py-2 rounded-lg bg-[#F9E2E7] hover:bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] flex items-center gap-1 cursor-pointer flex-shrink-0">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Upload Cover</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'cover_url', 'covers')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Custom Center Vinyl Photo URL & Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Custom Foto Label Tengah Piringan Hitam (Vinyl Sticker) *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editingSong.vinyl_photo_url || ''}
                          onChange={(e) =>
                            setEditingSong({ ...editingSong, vinyl_photo_url: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                          placeholder="URL stiker tengah vinyl"
                        />
                        <label className="px-3 py-2 rounded-lg bg-[#F9E2E7] hover:bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] flex items-center gap-1 cursor-pointer flex-shrink-0">
                          <Disc className="w-3.5 h-3.5" />
                          <span>Upload Stiker</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'vinyl_photo_url', 'vinyl_stickers')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Lyrics Note */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Kutipan Lirik Berkesan
                      </label>
                      <textarea
                        rows={2}
                        value={editingSong.lyrics || ''}
                        onChange={(e) => setEditingSong({ ...editingSong, lyrics: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-cormorant"
                        placeholder="Contoh: Selamanya berdua sampai kita jadi debu..."
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-dashed border-[#D8A7B1]">
                      <button
                        type="button"
                        onClick={() => setEditingSong(null)}
                        className="px-4 py-2 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={uploadingFile}
                        className="px-5 py-2 rounded-lg bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {uploadingFile ? 'Mengunggah...' : 'Simpan Lagu'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: FOTO KENANGAN PDKT
            ------------------------------------------------------------- */}
        {activeTab === 'pdkt' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#4A1E28]">
                  Foto Kenangan PDKT ({pdktPhotos.length})
                </h2>
                <p className="text-xs font-cormorant text-[#6B2D39] italic font-semibold">
                  Foto-foto kenangan masa PDKT Ciyan &amp; Daffa yang ditampilkan di timeline vertikal scrapbook.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingPhoto({
                    title: '',
                    caption: '',
                    date: '14 Agustus 2023',
                    location: '',
                    image_url: '',
                    category: 'pdkt',
                    rotation: -1.5,
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] text-xs font-serif font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Foto PDKT</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pdktPhotos.map((p) => (
                <div key={p.id} className="scrapbook-card p-4 flex flex-col justify-between">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#D8A7B1] mb-3 bg-[#FAF4F0]">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39]">
                      Timeline PDKT
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#4A1E28] mt-1.5 truncate">
                      {p.title}
                    </h3>
                    <p className="text-xs font-cormorant text-[#6B2D39] line-clamp-2 mt-0.5 font-medium">
                      {p.caption}
                    </p>
                    <p className="text-[11px] text-[#C89D66] font-semibold mt-1">
                      {p.date} {p.location ? `• ${p.location}` : ''}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-dashed border-[#D8A7B1]">
                    <button
                      type="button"
                      onClick={() => setEditingPhoto(p)}
                      className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39] cursor-pointer"
                      title="Edit Foto PDKT"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(p.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-300 text-red-600 cursor-pointer"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pdktPhotos.length === 0 && (
              <div className="text-center py-12 scrapbook-card bg-[#FFFDF9] p-6">
                <Camera className="w-10 h-10 text-[#D8A7B1] mx-auto mb-2" />
                <p className="text-sm font-serif font-semibold text-[#6B2D39]">
                  Belum ada foto kenangan PDKT.
                </p>
                <p className="text-xs font-cormorant text-[#4A1E28]/70 mt-1">
                  Klik tombol &ldquo;Tambah Foto PDKT&rdquo; untuk menambahkan foto pertama!
                </p>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: FOTO 3D EXHIBITION
            ------------------------------------------------------------- */}
        {activeTab === '3d_photos' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#4A1E28]">
                  Foto 3D Exhibition (Floating Frames) ({exhibitionPhotos.length})
                </h2>
                <p className="text-xs font-cormorant text-[#6B2D39] italic font-semibold">
                  Foto-foto yang dipajang di galeri 3D Three.js dengan rotasi sumbu X &amp; Y dan kelopak bunga mawar berjatuhan.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingPhoto({
                    title: '',
                    caption: '',
                    date: '29 September 2025',
                    location: '',
                    image_url: '',
                    category: '3d_exhibition',
                    rotation: 0,
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] text-xs font-serif font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Foto 3D Exhibition</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {exhibitionPhotos.map((p) => (
                <div key={p.id} className="scrapbook-card p-4 flex flex-col justify-between">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#D8A7B1] mb-3 bg-[#FAF4F0]">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF4F0] border border-[#C89D66] text-[#C89D66]">
                      3D Exhibition
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#4A1E28] mt-1.5 truncate">
                      {p.title}
                    </h3>
                    <p className="text-xs font-cormorant text-[#6B2D39] line-clamp-2 mt-0.5 font-medium">
                      {p.caption}
                    </p>
                    <p className="text-[11px] text-[#C89D66] font-semibold mt-1">
                      {p.date} {p.location ? `• ${p.location}` : ''}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-dashed border-[#D8A7B1]">
                    <button
                      type="button"
                      onClick={() => setEditingPhoto(p)}
                      className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39] cursor-pointer"
                      title="Edit Foto 3D"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(p.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-300 text-red-600 cursor-pointer"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {exhibitionPhotos.length === 0 && (
              <div className="text-center py-12 scrapbook-card bg-[#FFFDF9] p-6">
                <Sparkles className="w-10 h-10 text-[#C89D66] mx-auto mb-2" />
                <p className="text-sm font-serif font-semibold text-[#6B2D39]">
                  Belum ada foto 3D Exhibition.
                </p>
                <p className="text-xs font-cormorant text-[#4A1E28]/70 mt-1">
                  Klik tombol &ldquo;Tambah Foto 3D Exhibition&rdquo; untuk memasang foto di ruang 3D!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal Dialog for Photo Edit / Add (Shared for both PDKT and 3D) */}
        {editingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A1E28]/60 overflow-y-auto">
            <div className="relative w-full max-w-xl scrapbook-card p-6 bg-[#FFFDF9] max-h-[90vh] overflow-y-auto">
              <div className="scrapbook-tape" />
              <h3 className="text-xl font-serif font-bold text-[#4A1E28] mb-1">
                {editingPhoto.id ? 'Edit Foto' : 'Tambah Foto Baru'}
              </h3>
              <p className="text-xs font-cormorant text-[#6B2D39] mb-4">
                Pilih kategori yang sesuai untuk menempatkan foto di Timeline PDKT atau Galeri 3D.
              </p>

              <form onSubmit={handleSavePhoto} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                    Judul Momen *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPhoto.title || ''}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                    placeholder="Contoh: Kencan Kopi & Hujan Pertama"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                      Kategori Penempatan *
                    </label>
                    <select
                      value={editingPhoto.category || 'pdkt'}
                      onChange={(e) =>
                        setEditingPhoto({
                          ...editingPhoto,
                          category: e.target.value as PhotoCategory,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-semibold text-[#4A1E28]"
                    >
                      <option value="pdkt">Timeline Kenangan PDKT</option>
                      <option value="3d_exhibition">3D Floating Exhibition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                      Tanggal Kenangan
                    </label>
                    <input
                      type="text"
                      value={editingPhoto.date || ''}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                      placeholder="Contoh: 14 Agustus 2023"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                      Lokasi Momen
                    </label>
                    <input
                      type="text"
                      value={editingPhoto.location || ''}
                      onChange={(e) =>
                        setEditingPhoto({ ...editingPhoto, location: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                      placeholder="Kedai Kopi Sudut Kota"
                    />
                  </div>
                </div>

                {/* Image URL & File Upload to Supabase */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                    URL Gambar Foto *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editingPhoto.image_url || ''}
                      onChange={(e) =>
                        setEditingPhoto({ ...editingPhoto, image_url: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                      placeholder="https://... atau pilih file foto"
                    />
                    <label className="px-3 py-2 rounded-lg bg-[#F9E2E7] hover:bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] flex items-center gap-1 cursor-pointer flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'image_url', 'photos')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                    Catatan Kenangan / Caption
                  </label>
                  <textarea
                    rows={3}
                    value={editingPhoto.caption || ''}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, caption: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-cormorant font-medium"
                    placeholder="Tuliskan cerita manis di balik foto ini..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-dashed border-[#D8A7B1]">
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingFile}
                    className="px-5 py-2 rounded-lg bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {uploadingFile ? 'Mengunggah...' : 'Simpan Foto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: COUNTDOWNS
            ------------------------------------------------------------- */}
        {activeTab === 'countdowns' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold text-[#4A1E28]">
                Pengaturan Countdown &amp; Momen Spesial
              </h2>
              <button
                type="button"
                onClick={() =>
                  setEditingCountdown({
                    title: '',
                    target_date: '2027-09-29T00:00:00',
                    category: 'custom',
                    description: '',
                    badge: 'Momen Spesial',
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] text-xs font-serif font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Momen Countdown</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {countdowns.map((c) => (
                <div key={c.id} className="scrapbook-card p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39]">
                        {c.badge || c.category}
                      </span>
                      <span className="text-xs font-serif font-bold text-[#C89D66] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {(() => {
                          try {
                            const d = new Date(c.target_date);
                            return isNaN(d.getTime())
                              ? c.target_date.slice(0, 10)
                              : d.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                              });
                          } catch {
                            return c.target_date.slice(0, 10);
                          }
                        })()}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#4A1E28]">{c.title}</h3>
                    <p className="text-xs font-cormorant text-[#6B2D39] mt-1">{c.description}</p>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-dashed border-[#D8A7B1]">
                    <button
                      type="button"
                      onClick={() => handleDeleteCountdown(c.id)}
                      className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-rose-100 border border-[#D8A7B1] text-rose-600 cursor-pointer"
                      title="Hapus Countdown"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCountdown(c)}
                      className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39] cursor-pointer"
                      title="Edit Countdown"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Countdown Modal */}
            {editingCountdown && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A1E28]/60">
                <div className="relative w-full max-w-lg scrapbook-card p-6 bg-[#FFFDF9] max-h-[90vh] overflow-y-auto">
                  <div className="scrapbook-tape" />
                  <h3 className="text-xl font-serif font-bold text-[#4A1E28] mb-4">
                    {editingCountdown.id ? 'Edit Momen Countdown' : 'Tambah Momen Countdown Baru'}
                  </h3>

                  <form onSubmit={handleSaveCountdown} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Judul Momen *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCountdown.title || ''}
                        onChange={(e) =>
                          setEditingCountdown({ ...editingCountdown, title: e.target.value })
                        }
                        placeholder="Contoh: Sweet 20th Ciyan"
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif"
                      />
                    </div>

                    {/* Badge Pengaturan */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-[#6B2D39]">
                          Teks Badge Momen (Pill Kecil di Atas Judul)
                        </label>
                        {editingCountdown.badge && (
                          <span className="text-[10px] font-serif font-semibold px-2 py-0.5 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39]">
                            Preview: {editingCountdown.badge}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={editingCountdown.badge || ''}
                        onChange={(e) =>
                          setEditingCountdown({ ...editingCountdown, badge: e.target.value })
                        }
                        placeholder="Contoh: Sweet 20th Ciyan / Milestone / Hari Kasih Sayang"
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['Sweet 20th Ciyan', 'Ultah Daffa', 'Hari Kasih Sayang', 'Anniversary', 'First Date'].map(
                          (preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() =>
                                setEditingCountdown({ ...editingCountdown, badge: preset })
                              }
                              className="px-2 py-0.5 rounded-md bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[10px] font-serif text-[#6B2D39] cursor-pointer"
                            >
                              + {preset}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Kategori & Ikon */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Kategori &amp; Ikon
                      </label>
                      <select
                        value={editingCountdown.category || 'custom'}
                        onChange={(e) =>
                          setEditingCountdown({
                            ...editingCountdown,
                            category: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif text-[#4A1E28]"
                      >
                        <option value="birthday_ciyan">Ulang Tahun Ciyan (🎁 Ikon Kado)</option>
                        <option value="birthday_daffa">Ulang Tahun Daffa (✨ Ikon Bintang)</option>
                        <option value="valentine">Hari Kasih Sayang (💖 Ikon Hati)</option>
                        <option value="anniversary">Anniversary (⏰ Ikon Jam)</option>
                        <option value="custom">Momen Spesial Lainnya (📅 Ikon Kalender)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Target Tanggal &amp; Waktu (ISO format) *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={
                          editingCountdown.target_date
                            ? editingCountdown.target_date.slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          setEditingCountdown({
                            ...editingCountdown,
                            target_date: new Date(e.target.value).toISOString(),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        rows={2}
                        value={editingCountdown.description || ''}
                        onChange={(e) =>
                          setEditingCountdown({
                            ...editingCountdown,
                            description: e.target.value,
                          })
                        }
                        placeholder="Pesan manis atau harapan untuk momen ini..."
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-dashed border-[#D8A7B1]">
                      <button
                        type="button"
                        onClick={() => setEditingCountdown(null)}
                        className="px-4 py-2 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        Simpan Countdown
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: SECRET SCRATCH MESSAGES
            ------------------------------------------------------------- */}
        {activeTab === 'secrets' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold text-[#4A1E28]">
                Surat Rahasia Bertinta Emas (Scratch Cards)
              </h2>
              <button
                type="button"
                onClick={() =>
                  setEditingSecret({
                    title: '',
                    message: '',
                    author: 'Daffa',
                    scratch_percent_required: 40,
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] text-xs font-serif font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Surat Baru</span>
              </button>
            </div>

            <div className="space-y-4">
              {secrets.map((sec) => (
                <div key={sec.id} className="scrapbook-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39]">
                      Penulis: {sec.author === 'Both' ? 'Kita Berdua' : sec.author}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingSecret(sec)}
                      className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39] cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#4A1E28] mb-1">{sec.title}</h3>
                  <p className="font-script text-base text-[#6B2D39] bg-[#FAF4F0] p-3 rounded-lg border border-dashed border-[#D8A7B1]">
                    &ldquo;{sec.message}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            {/* Secret Modal */}
            {editingSecret && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A1E28]/60">
                <div className="relative w-full max-w-lg scrapbook-card p-6 bg-[#FFFDF9]">
                  <div className="scrapbook-tape" />
                  <h3 className="text-xl font-serif font-bold text-[#4A1E28] mb-4">
                    Edit Surat Rahasia
                  </h3>

                  <form onSubmit={handleSaveSecret} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Judul Surat *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingSecret.title || ''}
                        onChange={(e) =>
                          setEditingSecret({ ...editingSecret, title: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Penulis
                      </label>
                      <select
                        value={editingSecret.author || 'Daffa'}
                        onChange={(e) =>
                          setEditingSecret({
                            ...editingSecret,
                            author: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-medium"
                      >
                        <option value="Daffa">Daffa</option>
                        <option value="Ciyan">Ciyan</option>
                        <option value="Both">Kita Berdua</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                        Isi Pesan Surat Cinta *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={editingSecret.message || ''}
                        onChange={(e) =>
                          setEditingSecret({ ...editingSecret, message: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-script text-base"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-dashed border-[#D8A7B1]">
                      <button
                        type="button"
                        onClick={() => setEditingSecret(null)}
                        className="px-4 py-2 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        Simpan Surat
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: JOURNEY SETTINGS (PERJALANAN SEJAK & WAKTU JADIAN)
            ------------------------------------------------------------- */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#4A1E28]">
                  Pengaturan Perjalanan Sejak (Waktu Jadian)
                </h2>
                <p className="text-xs font-cormorant text-[#6B2D39] italic font-semibold">
                  Atur tanggal jadian dan kata-kata romantis untuk widget Live Count-Up di halaman utama.
                </p>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="scrapbook-card-pink p-6 text-center relative">
              <div className="scrapbook-tape" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#D8A7B1] text-xs font-serif font-semibold text-[#6B2D39] mb-3 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-[#C89D66] fill-[#C89D66]" />
                <span>{journeyForm.badgeText || 'Bersama Sejak...'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#4A1E28] mb-1">
                {journeyForm.title || 'Perjalanan Indah Kita Berdua'}
              </h3>
              <p className="text-xs font-cormorant text-[#6B2D39] italic max-w-md mx-auto mb-5 font-medium">
                {journeyForm.description || 'Tidak ada satu detik pun yang berlalu...'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                <div className="scrapbook-card p-3 bg-[#FFFDF9] text-center">
                  <span className="block text-2xl font-serif font-bold text-[#4A1E28] tabular-nums">
                    {Math.floor(
                      Math.max(0, Date.now() - new Date(journeyForm.startDate || '2025-09-29').getTime()) /
                      (1000 * 60 * 60 * 24)
                    )}
                  </span>
                  <span className="block text-[10px] font-mono uppercase font-bold text-[#6B2D39]">
                    Hari Terlewati
                  </span>
                </div>
                <div className="scrapbook-card p-3 bg-[#FFFDF9] text-center">
                  <span className="block text-2xl font-serif font-bold text-[#4A1E28] tabular-nums">
                    {String(
                      Math.floor(
                        (Math.max(0, Date.now() - new Date(journeyForm.startDate || '2025-09-29').getTime()) /
                          (1000 * 60 * 60)) %
                        24
                      )
                    ).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] font-mono uppercase font-bold text-[#6B2D39]">
                    Jam
                  </span>
                </div>
                <div className="scrapbook-card p-3 bg-[#FFFDF9] text-center">
                  <span className="block text-2xl font-serif font-bold text-[#4A1E28] tabular-nums">
                    {String(
                      Math.floor(
                        (Math.max(0, Date.now() - new Date(journeyForm.startDate || '2025-09-29').getTime()) /
                          (1000 * 60)) %
                        60
                      )
                    ).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] font-mono uppercase font-bold text-[#6B2D39]">
                    Menit
                  </span>
                </div>
                <div className="scrapbook-card p-3 bg-[#FFFDF9] text-center">
                  <span className="block text-2xl font-serif font-bold text-[#4A1E28] tabular-nums">
                    {String(
                      Math.floor(
                        (Math.max(0, Date.now() - new Date(journeyForm.startDate || '2025-09-29').getTime()) /
                          1000) %
                        60
                      )
                    ).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] font-mono uppercase font-bold text-[#6B2D39]">
                    Detik
                  </span>
                </div>
              </div>
            </div>

            {/* Form Settings */}
            <div className="scrapbook-card p-6 bg-[#FFFDF9]">
              <form onSubmit={handleSaveJourney} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                    Tanggal &amp; Jam Mulai Jadian (Start Date &amp; Time) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={
                      journeyForm.startDate
                        ? journeyForm.startDate.slice(0, 16)
                        : '2025-09-29T00:00'
                    }
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setJourneyForm({
                        ...journeyForm,
                        startDate: newDate ? `${newDate}:00` : journeyForm.startDate,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif font-semibold text-[#4A1E28]"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setJourneyForm({
                          ...journeyForm,
                          startDate: '2025-09-29T00:00:00',
                          badgeText: 'Bersama Sejak 29 September 2025',
                        })
                      }
                      className="px-2.5 py-1 rounded-md bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[11px] font-serif text-[#6B2D39] cursor-pointer"
                    >
                      Preset: 29 September 2025 (Ciyan &amp; Daffa)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setFullYear(d.getFullYear() - 1);
                        const iso = d.toISOString().slice(0, 19);
                        setJourneyForm({
                          ...journeyForm,
                          startDate: iso,
                        });
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[11px] font-serif text-[#6B2D39] cursor-pointer"
                    >
                      Preset: 1 Tahun Lalu
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                    Teks Badge (Label Kecil di Atas Judul) *
                  </label>
                  <input
                    type="text"
                    required
                    value={journeyForm.badgeText}
                    onChange={(e) =>
                      setJourneyForm({ ...journeyForm, badgeText: e.target.value })
                    }
                    placeholder="Contoh: Bersama Sejak 29 September 2025"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                    Judul Utama Perjalanan *
                  </label>
                  <input
                    type="text"
                    required
                    value={journeyForm.title}
                    onChange={(e) =>
                      setJourneyForm({ ...journeyForm, title: e.target.value })
                    }
                    placeholder="Contoh: Perjalanan Indah Kita Berdua"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif font-bold text-[#4A1E28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B2D39] mb-1">
                    Kutipan / Deskripsi Cinta *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={journeyForm.description}
                    onChange={(e) =>
                      setJourneyForm({ ...journeyForm, description: e.target.value })
                    }
                    placeholder="Contoh: Tidak ada satu detik pun yang berlalu tanpa rasa syukur karena memilikimu di sisiku."
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-cormorant text-sm italic"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={savingJourney}
                    className="px-6 py-2.5 rounded-xl bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] text-xs font-serif font-bold cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-current text-rose-300" />
                    <span>{savingJourney ? 'Menyimpan...' : 'Simpan Perjalanan Sejak'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJourneyForm(journey)}
                    className="px-4 py-2.5 rounded-xl bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-serif font-semibold text-[#6B2D39] cursor-pointer"
                  >
                    Reset Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminPage;
