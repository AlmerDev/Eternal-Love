/**
 * Timezone utilities configured specifically for Asia/Jakarta (WIB = UTC+7)
 * Ensures that all date, month, year, hour, and countdown calculations
 * strictly follow Asia/Jakarta without unwanted UTC/local shifts.
 */

export const JAKARTA_TIMEZONE = 'Asia/Jakarta';
export const JAKARTA_OFFSET_HOURS = 7;
export const JAKARTA_OFFSET_MS = JAKARTA_OFFSET_HOURS * 60 * 60 * 1000;

export interface JakartaDateParts {
  year: number;
  month: number; // 1-12
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CountdownRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast?: boolean;
}

export const INDO_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Parses any date string or Date object, ensuring it is interpreted
 * in Asia/Jakarta (UTC+7) if no timezone offset is provided.
 */
export function parseJakartaDate(input: string | Date | number | null | undefined): Date {
  if (!input) return new Date();

  if (typeof input === 'number') {
    return new Date(input);
  }

  if (input instanceof Date) {
    return new Date(input.getTime());
  }

  const str = String(input).trim();
  if (!str) return new Date();

  // If string contains timezone indicator (Z or +HH:mm or -HH:mm at the end)
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  // If format is YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss without timezone, append +07:00
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    const withSeconds = str.length === 16 ? `${str}:00` : str;
    const d = new Date(`${withSeconds}+07:00`);
    if (!isNaN(d.getTime())) return d;
  }

  // If format is YYYY-MM-DD (date only), treat as midnight in Asia/Jakarta
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(`${str}T00:00:00+07:00`);
    if (!isNaN(d.getTime())) return d;
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

/**
 * Extracts exact year, month, day, hour, minute, second components in Asia/Jakarta (UTC+7).
 */
export function getJakartaDateParts(input: string | Date | number | null | undefined): JakartaDateParts {
  const d = parseJakartaDate(input);
  // Shift UTC time by +7 hours to inspect calendar components in Jakarta time
  const shifted = new Date(d.getTime() + JAKARTA_OFFSET_MS);

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
    seconds: shifted.getUTCSeconds(),
  };
}

/**
 * Converts any date representation to the format required by <input type="datetime-local" />
 * which is always "YYYY-MM-DDTHH:mm" in Asia/Jakarta time.
 */
export function formatToJakartaInput(input: string | Date | number | null | undefined): string {
  if (!input) return '2027-09-29T00:00';
  const parts = getJakartaDateParts(input);
  const y = String(parts.year).padStart(4, '0');
  const m = String(parts.month).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  const h = String(parts.hours).padStart(2, '0');
  const min = String(parts.minutes).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

/**
 * Takes the raw value from <input type="datetime-local" /> (e.g. "2027-09-29T14:30")
 * and converts it to a standard Asia/Jakarta ISO string with "+07:00" offset.
 */
export function toJakartaISOString(localInputValue: string): string {
  if (!localInputValue) return '2027-09-29T00:00:00+07:00';
  const trimmed = localInputValue.trim();
  if (trimmed.length === 16) {
    return `${trimmed}:00+07:00`;
  }
  if (trimmed.length === 19) {
    return `${trimmed}+07:00`;
  }
  return parseJakartaDate(trimmed).toISOString();
}

/**
 * Formats a date into a friendly Indonesian display text in Asia/Jakarta timezone.
 * Example: "29 September 2027, 14:30 WIB" or "29 September"
 */
export function formatJakartaDisplay(
  input: string | Date | number | null | undefined,
  options?: {
    includeTime?: boolean;
    includeYear?: boolean;
    includeTimezone?: boolean;
  }
): string {
  const parts = getJakartaDateParts(input);
  const monthName = INDO_MONTHS[parts.month - 1] || 'September';
  const includeYear = options?.includeYear ?? true;
  const includeTime = options?.includeTime ?? false;
  const includeTz = options?.includeTimezone ?? false;

  let result = `${parts.day} ${monthName}`;
  if (includeYear) {
    result += ` ${parts.year}`;
  }

  if (includeTime) {
    const h = String(parts.hours).padStart(2, '0');
    const m = String(parts.minutes).padStart(2, '0');
    result += `, ${h}:${m}`;
    if (includeTz) {
      result += ' WIB';
    }
  }

  return result;
}

/**
 * Formats date summary for recurring loop display.
 * Example: "29 September • 00:00 WIB"
 */
export function formatLoopDateSummary(input: string | Date | number | null | undefined): string {
  const parts = getJakartaDateParts(input);
  const mName = INDO_MONTHS[parts.month - 1] || 'September';
  const h = String(parts.hours).padStart(2, '0');
  const min = String(parts.minutes).padStart(2, '0');
  return `${parts.day} ${mName} (Jam ${h}:${min} WIB)`;
}

/**
 * Calculates the next upcoming occurrence for a specific day, month, and optional time in Asia/Jakarta.
 * If this year's date & time has already passed, it automatically loops to next year.
 */
export function getNextJakartaOccurrence(
  month: number, // 1-12
  day: number, // 1-31
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0
): { targetDate: Date; targetISO: string; year: number } {
  const now = Date.now();
  const nowParts = getJakartaDateParts(now);

  let year = nowParts.year;
  const mStr = String(month).padStart(2, '0');
  const dStr = String(day).padStart(2, '0');
  const hStr = String(hours).padStart(2, '0');
  const minStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');

  let candidate = parseJakartaDate(`${year}-${mStr}-${dStr}T${hStr}:${minStr}:${sStr}+07:00`);

  // If candidate has already passed, roll to next year!
  if (candidate.getTime() <= now) {
    year += 1;
    candidate = parseJakartaDate(`${year}-${mStr}-${dStr}T${hStr}:${minStr}:${sStr}+07:00`);
  }

  return {
    targetDate: candidate,
    targetISO: `${year}-${mStr}-${dStr}T${hStr}:${minStr}:${sStr}+07:00`,
    year,
  };
}

/**
 * Calculates remaining time until target date in Asia/Jakarta timezone.
 * Every countdown is an annually recurring milestone based on Tanggal, Bulan, dan Jam.
 * When the moment passes (e.g. 29 September 00:00 WIB), the timer automatically
 * rolls over and loops for the next year!
 */
export function calculateJakartaCountdown(
  targetDateInput: string | Date | number,
  _category?: string
): CountdownRemaining {
  const now = Date.now();
  const targetDate = parseJakartaDate(targetDateInput);
  const parts = getJakartaDateParts(targetDate);
  const nowParts = getJakartaDateParts(now);

  // Automatically roll over based on Tanggal, Bulan, dan Jam
  let year = nowParts.year;
  const mStr = String(parts.month).padStart(2, '0');
  const dStr = String(parts.day).padStart(2, '0');
  const hStr = String(parts.hours).padStart(2, '0');
  const minStr = String(parts.minutes).padStart(2, '0');
  const sStr = String(parts.seconds).padStart(2, '0');

  let targetCandidate = parseJakartaDate(
    `${year}-${mStr}-${dStr}T${hStr}:${minStr}:${sStr}+07:00`
  );

  // If this year's date & time has already passed (or is right now), automatically roll to next year!
  if (targetCandidate.getTime() <= now) {
    year += 1;
    targetCandidate = parseJakartaDate(
      `${year}-${mStr}-${dStr}T${hStr}:${minStr}:${sStr}+07:00`
    );
  }

  const diff = Math.max(0, targetCandidate.getTime() - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
  };
}

/**
 * Calculates count-up elapsed time since a given start date in Asia/Jakarta (WIB).
 */
export function calculateJakartaElapsed(startDateInput: string | Date | number): CountdownRemaining {
  const now = Date.now();
  const start = parseJakartaDate(startDateInput).getTime();
  const diff = Math.max(0, now - start);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
  };
}
