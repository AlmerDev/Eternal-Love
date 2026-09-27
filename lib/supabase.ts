import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database, Song, Photo, CountdownItem, SecretMessage, Setting, JourneySettings } from '../types/database';
import {
  INITIAL_SONGS,
  INITIAL_PHOTOS,
  INITIAL_COUNTDOWNS,
  INITIAL_SECRET_MESSAGES,
  INITIAL_JOURNEY_SETTINGS,
} from './initial-data';

// Helper to access environment variables from Vite or process.env
export const getEnvVar = (viteKey: string, nextKey?: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const env = (import.meta as any).env;
      if (env[viteKey]) return env[viteKey];
      if (nextKey && env[nextKey]) return env[nextKey];
    }
  } catch {
    // Ignore error
  }

  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[viteKey]) return process.env[viteKey] as string;
      if (nextKey && process.env[nextKey]) return process.env[nextKey] as string;
    }
  } catch {
    // Ignore error
  }

  return '';
};

export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

let supabaseInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  const url = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !key || url.includes('your-project') || key.includes('your-anon-key') || url.includes('placeholder')) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseInstance;
};

export const isSupabaseConfigured = (): boolean => {
  const url = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return Boolean(
    url &&
    key &&
    !url.includes('your-project') &&
    !key.includes('your-anon-key') &&
    !url.includes('placeholder')
  );
};

/* =========================================================================
   LOCAL STORAGE PERSISTENCE HELPERS (Seamless fallback when offline/demo)
   ========================================================================= */

const LOCAL_STORAGE_KEYS = {
  SONGS: 'eternal_love_songs_v2',
  PHOTOS: 'eternal_love_photos_v1',
  COUNTDOWNS: 'eternal_love_countdowns_v1',
  SECRETS: 'eternal_love_secrets_v1',
  JOURNEY: 'eternal_love_journey_v1',
};

const getLocalData = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const setLocalData = <T>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
};

/* =========================================================================
   DATABASE CRUD REPOSITORY (Supabase with LocalStorage Sync)
   ========================================================================= */

export const api = {
  // --- SONGS ---
  async getSongs(): Promise<Song[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('songs')
          .select('*')
          .order('order_index', { ascending: true });
        if (!error && data && data.length > 0) {
          setLocalData(LOCAL_STORAGE_KEYS.SONGS, data);
          return data as Song[];
        }
      } catch (err) {
        console.warn('Supabase getSongs failed, using local storage cache:', err);
      }
    }
    return getLocalData<Song[]>(LOCAL_STORAGE_KEYS.SONGS, INITIAL_SONGS);
  },

  async saveSong(song: Song): Promise<Song> {
    const client = getSupabaseClient();
    const current = await this.getSongs();
    const exists = current.find((s) => s.id === song.id);
    const updatedList = exists
      ? current.map((s) => (s.id === song.id ? song : s))
      : [...current, song];

    setLocalData(LOCAL_STORAGE_KEYS.SONGS, updatedList);

    if (client) {
      try {
        await client.from('songs').upsert(song as any);
      } catch (err) {
        console.warn('Supabase saveSong error:', err);
      }
    }
    return song;
  },

  async deleteSong(id: string): Promise<void> {
    const current = await this.getSongs();
    const filtered = current.filter((s) => s.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.SONGS, filtered);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('songs').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteSong error:', err);
      }
    }
  },

  // --- PHOTOS ---
  async getPhotos(): Promise<Photo[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('photos')
          .select('*')
          .order('order_index', { ascending: true });
        if (!error && data && data.length > 0) {
          setLocalData(LOCAL_STORAGE_KEYS.PHOTOS, data);
          return data as Photo[];
        }
      } catch (err) {
        console.warn('Supabase getPhotos failed, using local cache:', err);
      }
    }
    return getLocalData<Photo[]>(LOCAL_STORAGE_KEYS.PHOTOS, INITIAL_PHOTOS);
  },

  async savePhoto(photo: Photo): Promise<Photo> {
    const client = getSupabaseClient();
    const current = await this.getPhotos();
    const exists = current.find((p) => p.id === photo.id);
    const updatedList = exists
      ? current.map((p) => (p.id === photo.id ? photo : p))
      : [...current, photo];

    setLocalData(LOCAL_STORAGE_KEYS.PHOTOS, updatedList);

    if (client) {
      try {
        await client.from('photos').upsert(photo as any);
      } catch (err) {
        console.warn('Supabase savePhoto error:', err);
      }
    }
    return photo;
  },

  async deletePhoto(id: string): Promise<void> {
    const current = await this.getPhotos();
    const filtered = current.filter((p) => p.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.PHOTOS, filtered);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('photos').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deletePhoto error:', err);
      }
    }
  },

  // --- COUNTDOWNS ---
  async getCountdowns(): Promise<CountdownItem[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('countdowns').select('*');
        if (!error && data && data.length > 0) {
          setLocalData(LOCAL_STORAGE_KEYS.COUNTDOWNS, data);
          return data as CountdownItem[];
        }
      } catch (err) {
        console.warn('Supabase getCountdowns fallback:', err);
      }
    }
    return getLocalData<CountdownItem[]>(LOCAL_STORAGE_KEYS.COUNTDOWNS, INITIAL_COUNTDOWNS);
  },

  async saveCountdown(item: CountdownItem): Promise<CountdownItem> {
    const current = await this.getCountdowns();
    const exists = current.find((c) => c.id === item.id);
    const updated = exists ? current.map((c) => (c.id === item.id ? item : c)) : [...current, item];
    setLocalData(LOCAL_STORAGE_KEYS.COUNTDOWNS, updated);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('countdowns').upsert(item as any);
      } catch (err) {
        console.warn('Supabase saveCountdown error:', err);
      }
    }
    return item;
  },

  async deleteCountdown(id: string): Promise<void> {
    const current = await this.getCountdowns();
    const updated = current.filter((c) => c.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.COUNTDOWNS, updated);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('countdowns').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteCountdown error:', err);
      }
    }
  },

  // --- SECRET MESSAGES ---
  async getSecretMessages(): Promise<SecretMessage[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('secret_messages').select('*');
        if (!error && data && data.length > 0) {
          setLocalData(LOCAL_STORAGE_KEYS.SECRETS, data);
          return data as SecretMessage[];
        }
      } catch (err) {
        console.warn('Supabase getSecretMessages fallback:', err);
      }
    }
    return getLocalData<SecretMessage[]>(LOCAL_STORAGE_KEYS.SECRETS, INITIAL_SECRET_MESSAGES);
  },

  async saveSecretMessage(msg: SecretMessage): Promise<SecretMessage> {
    const current = await this.getSecretMessages();
    const exists = current.find((m) => m.id === msg.id);
    const updated = exists ? current.map((m) => (m.id === msg.id ? msg : m)) : [...current, msg];
    setLocalData(LOCAL_STORAGE_KEYS.SECRETS, updated);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('secret_messages').upsert(msg as any);
      } catch (err) {
        console.warn('Supabase saveSecretMessage error:', err);
      }
    }
    return msg;
  },

  // --- JOURNEY SETTINGS (Perjalanan Sejak & Anniversary) ---
  async getJourneySettings(): Promise<JourneySettings> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('settings')
          .select('*')
          .eq('key', 'journey_settings')
          .maybeSingle();
        const row = data as Setting | null;
        if (!error && row && row.value) {
          const parsed = JSON.parse(row.value);
          setLocalData(LOCAL_STORAGE_KEYS.JOURNEY, parsed);
          return parsed as JourneySettings;
        }
      } catch (err) {
        console.warn('Supabase getJourneySettings fallback:', err);
      }
    }
    const local = getLocalData<JourneySettings>(LOCAL_STORAGE_KEYS.JOURNEY, INITIAL_JOURNEY_SETTINGS);
    if (local && local.startDate && local.startDate.includes('2023-09-29')) {
      local.startDate = local.startDate.replace('2023-09-29', '2025-09-29');
      if (local.badgeText && local.badgeText.includes('2023')) {
        local.badgeText = local.badgeText.replace('2023', '2025');
      }
      setLocalData(LOCAL_STORAGE_KEYS.JOURNEY, local);
    }
    return local;
  },

  async saveJourneySettings(settings: JourneySettings): Promise<JourneySettings> {
    setLocalData(LOCAL_STORAGE_KEYS.JOURNEY, settings);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('settings').upsert({
          id: 'setting-journey',
          key: 'journey_settings',
          value: JSON.stringify(settings),
          updated_at: new Date().toISOString(),
        } as any);
      } catch (err) {
        console.warn('Supabase saveJourneySettings error:', err);
      }
    }
    return settings;
  },

  // --- FILE UPLOADS TO SUPABASE STORAGE 'media' BUCKET ---
  async uploadMediaFile(
    file: File,
    folder: 'covers' | 'vinyl_stickers' | 'photos' | 'audio' = 'photos'
  ): Promise<string> {
    const client = getSupabaseClient();

    // If Supabase Storage is configured, perform direct upload
    if (client) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const filePath = `${folder}/${Date.now()}_${cleanName}.${fileExt}`;

        const { error: uploadError } = await client.storage
          .from('media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!uploadError) {
          const { data } = client.storage.from('media').getPublicUrl(filePath);
          if (data?.publicUrl) {
            return data.publicUrl;
          }
        } else {
          console.warn('Supabase storage upload error:', uploadError.message);
        }
      } catch (err) {
        console.warn('Supabase storage upload exception:', err);
      }
    }

    // Fallback for offline/demo: convert file to local Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  // Reset to default romantic scrapbook data
  resetToDefaults() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.SONGS, JSON.stringify(INITIAL_SONGS));
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.PHOTOS, JSON.stringify(INITIAL_PHOTOS));
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.COUNTDOWNS, JSON.stringify(INITIAL_COUNTDOWNS));
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.SECRETS, JSON.stringify(INITIAL_SECRET_MESSAGES));
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.JOURNEY, JSON.stringify(INITIAL_JOURNEY_SETTINGS));
    }
  },
};
