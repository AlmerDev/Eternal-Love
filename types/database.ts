export type SongCategory = 'bgm' | 'abadi' | 'ciyan' | 'daffa';
export type PhotoCategory = 'pdkt' | '3d_exhibition' | 'scrapbook';

export interface Song {
  id: string;
  title: string;
  artist: string;
  category: SongCategory;
  audio_url: string;
  cover_url: string;
  vinyl_photo_url: string;
  lyrics?: string;
  duration?: string;
  order_index?: number;
  created_at?: string;
}

export interface Photo {
  id: string;
  title: string;
  caption: string;
  date: string;
  image_url: string;
  category: PhotoCategory;
  location?: string;
  rotation?: number; // scrapbook tilt angle in deg
  order_index?: number;
  created_at?: string;
}

export interface CountdownItem {
  id: string;
  title: string;
  target_date: string;
  category: 'birthday_ciyan' | 'birthday_daffa' | 'valentine' | 'anniversary' | 'custom';
  description: string;
  badge?: string;
}

export interface SecretMessage {
  id: string;
  title: string;
  message: string;
  author: 'Daffa' | 'Ciyan' | 'Both';
  scratch_percent_required?: number;
  created_at?: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  updated_at?: string;
}

export interface JourneySettings {
  startDate: string; // e.g. "2025-09-29T00:00:00"
  badgeText: string; // e.g. "Bersama Sejak 29 September 2025"
  title: string; // e.g. "Perjalanan Indah Kita Berdua"
  description: string; // e.g. "Tidak ada satu detik pun yang berlalu tanpa rasa syukur karena memilikimu di sisiku."
}

export interface Database {
  public: {
    Tables: {
      songs: {
        Row: Song;
        Insert: Omit<Song, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Song>;
      };
      photos: {
        Row: Photo;
        Insert: Omit<Photo, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Photo>;
      };
      settings: {
        Row: Setting;
        Insert: Omit<Setting, 'id' | 'updated_at'> & { id?: string; updated_at?: string };
        Update: Partial<Setting>;
      };
      countdowns: {
        Row: CountdownItem;
        Insert: Omit<CountdownItem, 'id'> & { id?: string };
        Update: Partial<CountdownItem>;
      };
      secret_messages: {
        Row: SecretMessage;
        Insert: Omit<SecretMessage, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<SecretMessage>;
      };
    };
  };
}
