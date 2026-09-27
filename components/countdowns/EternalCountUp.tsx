import React, { useState, useEffect } from 'react';
import { Clock, Hourglass, Calendar, Heart, Sparkles, Gift } from 'lucide-react';
import { CountdownItem, JourneySettings } from '../../types/database';

interface EternalCountUpProps {
  countdowns: CountdownItem[];
  anniversaryStartDate?: string; // fallback
  journeySettings?: JourneySettings;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast?: boolean;
}

export const EternalCountUp: React.FC<EternalCountUpProps> = ({
  countdowns,
  anniversaryStartDate = '2025-09-29T00:00:00',
  journeySettings,
}) => {
  const effectiveStartDate = journeySettings?.startDate || anniversaryStartDate;
  const effectiveBadge = journeySettings?.badgeText || 'Bersama Sejak 29 September 2025';
  const effectiveTitle = journeySettings?.title || 'Perjalanan Indah Kita Berdua';
  const effectiveDescription =
    journeySettings?.description ||
    'Tidak ada satu detik pun yang berlalu tanpa rasa syukur karena memilikimu di sisiku.';

  const [countUpTime, setCountUpTime] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [countdownsState, setCountdownsState] = useState<
    Array<{ item: CountdownItem; remaining: TimeRemaining }>
  >([]);

  // Calculate live count-up & countdowns every second
  useEffect(() => {
    const calculateAll = () => {
      const now = new Date().getTime();
      const start = new Date(effectiveStartDate).getTime();
      const diffSinceStart = Math.max(0, now - start);

      // Count up from start date
      const cDays = Math.floor(diffSinceStart / (1000 * 60 * 60 * 24));
      const cHours = Math.floor((diffSinceStart / (1000 * 60 * 60)) % 24);
      const cMinutes = Math.floor((diffSinceStart / (1000 * 60)) % 60);
      const cSeconds = Math.floor((diffSinceStart / 1000) % 60);

      setCountUpTime({
        days: cDays,
        hours: cHours,
        minutes: cMinutes,
        seconds: cSeconds,
      });

      // Countdowns calculation
      const calculatedItems = countdowns.map((item) => {
        let target = new Date(item.target_date).getTime();

        // If recurring event (e.g. anniversary or birthday in past this year), dynamically roll to next occurrence
        if (target < now) {
          const targetObj = new Date(item.target_date);
          const currentYear = new Date().getFullYear();
          targetObj.setFullYear(currentYear);
          if (targetObj.getTime() < now) {
            targetObj.setFullYear(currentYear + 1);
          }
          target = targetObj.getTime();
        }

        const diff = Math.max(0, target - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return {
          item,
          remaining: { days, hours, minutes, seconds },
        };
      });

      setCountdownsState(calculatedItems);
    };

    calculateAll();
    const interval = setInterval(calculateAll, 1000);
    return () => clearInterval(interval);
  }, [effectiveStartDate, countdowns]);

  const getCardIcon = (category: string) => {
    switch (category) {
      case 'anniversary':
        return <Sparkles className="w-5 h-5 text-[#C89D66]" />;
      case 'birthday_ciyan':
        return <Gift className="w-5 h-5 text-rose-400" />;
      case 'birthday_daffa':
        return <Gift className="w-5 h-5 text-[#C89D66]" />;
      case 'valentine':
        return <Heart className="w-5 h-5 text-[#6B2D39]" />;
      default:
        return <Calendar className="w-5 h-5 text-[#6B2D39]" />;
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  const getBadgeText = (item: CountdownItem) => {
    if (item.badge && item.badge.trim().length > 0) {
      return item.badge.trim();
    }
    switch (item.category) {
      case 'anniversary':
        return 'Anniversary Spesial';
      case 'birthday_ciyan':
        return 'Ulang Tahun Ciyan';
      case 'birthday_daffa':
        return 'Ulang Tahun Daffa';
      case 'valentine':
        return 'Hari Kasih Sayang';
      default:
        return 'Momen Spesial';
    }
  };

  return (
    <section id="countdowns-hub" className="relative my-16 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] mb-3">
          <Clock className="w-4 h-4 text-[#C89D66]" />
          <span>Eternal Count-Up &amp; Countdown Hub</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#4A1E28]">
          Menghitung Setiap Detik Kasih Kita
        </h2>
        <p className="mt-2 text-base font-cormorant text-[#6B2D39] italic font-medium">
          Waktu berjalan, namun cinta Ciyan &amp; Daffa terpatri abadi selamanya.
        </p>
      </div>

      {/* Main Live Count-Up Widget */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="relative scrapbook-card-pink p-6 sm:p-10 text-center">
          <div className="scrapbook-tape" />
          <div className="absolute top-3 right-4 scrapbook-pin" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDF9] border border-[#D8A7B1] text-xs font-serif font-semibold text-[#6B2D39] mb-4 shadow-sm">
            <Heart className="w-3.5 h-3.5 text-[#C89D66] fill-[#C89D66]" />
            <span>{effectiveBadge}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A1E28] mb-2">
            {effectiveTitle}
          </h3>
          <p className="text-sm font-cormorant text-[#6B2D39] italic max-w-md mx-auto mb-8 font-medium">
            {effectiveDescription}
          </p>

          {/* Large Digit Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="scrapbook-card p-4 sm:p-5 text-center bg-[#FFFDF9]">
              <span className="block text-3xl sm:text-5xl font-serif font-bold text-[#4A1E28] tabular-nums">
                {countUpTime.days}
              </span>
              <span className="block text-xs font-mono uppercase font-bold text-[#6B2D39] tracking-wider mt-1">
                Hari
              </span>
            </div>

            <div className="scrapbook-card p-4 sm:p-5 text-center bg-[#FFFDF9]">
              <span className="block text-3xl sm:text-5xl font-serif font-bold text-[#4A1E28] tabular-nums">
                {String(countUpTime.hours).padStart(2, '0')}
              </span>
              <span className="block text-xs font-mono uppercase font-bold text-[#6B2D39] tracking-wider mt-1">
                Jam
              </span>
            </div>

            <div className="scrapbook-card p-4 sm:p-5 text-center bg-[#FFFDF9]">
              <span className="block text-3xl sm:text-5xl font-serif font-bold text-[#4A1E28] tabular-nums">
                {String(countUpTime.minutes).padStart(2, '0')}
              </span>
              <span className="block text-xs font-mono uppercase font-bold text-[#6B2D39] tracking-wider mt-1">
                Menit
              </span>
            </div>

            <div className="scrapbook-card p-4 sm:p-5 text-center bg-[#FFFDF9]">
              <span className="block text-3xl sm:text-5xl font-serif font-bold text-[#6B2D39] tabular-nums">
                {String(countUpTime.seconds).padStart(2, '0')}
              </span>
              <span className="block text-xs font-mono uppercase font-bold text-[#6B2D39] tracking-wider mt-1">
                Detik
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Solid Countdown Cards Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Hourglass className="w-5 h-5 text-[#C89D66]" />
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#4A1E28]">
              Momen Spesial yang Dinanti Berikutnya
            </h3>
          </div>
          <p className="text-xs font-cormorant italic text-[#6B2D39] font-semibold">
            Diperbarui Secara Real-time • Menghitung Hari Bahagia Ciyan &amp; Daffa
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-stretch gap-4 sm:gap-5">
          {countdownsState.map(({ item, remaining }) => (
            <div
              key={item.id}
              className="relative scrapbook-card p-4 sm:p-5 flex flex-col justify-between items-center text-center hover:-translate-y-1.5 transition-all duration-300 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-16px)] max-w-sm shadow-md"
            >
              {/* Tape header centered */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-4 w-14 bg-[#F9E2E7] border border-dashed border-[#D8A7B1] rotate-[-1deg] z-10 shadow-xs" />

              <div className="flex flex-col items-center w-full">
                {/* Icon & Badge Centered */}
                <div className="flex flex-col items-center gap-2 mb-2.5">
                  <div className="p-2.5 rounded-2xl bg-[#FAF4F0] border border-[#D8A7B1] shadow-xs">
                    {getCardIcon(item.category)}
                  </div>
                  {/* Badge Momen (Selalu Tampil Jelas & Romantis, Termasuk yang Baru Ditambahkan) */}
                  <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-serif font-bold text-[#6B2D39] shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#C89D66] fill-[#C89D66]" />
                    <span>{getBadgeText(item)}</span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-serif font-bold text-base sm:text-lg text-[#4A1E28] mb-1.5">
                  {item.title}
                </h4>

                {/* Date & Month Badge (Tanpa Tahun) */}
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4F0] border border-[#D8A7B1] text-xs font-serif font-bold text-[#6B2D39] mb-2.5 shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#C89D66]" />
                  <span>{formatEventDate(item.target_date)}</span>
                </div>

                {/* Description */}
                <p className="font-cormorant text-xs text-[#6B2D39] italic mb-4 font-medium leading-relaxed max-w-xs">
                  {item.description}
                </p>
              </div>

              {/* Countdown Digits Pill Centered */}
              <div className="w-full bg-[#FAF4F0] rounded-xl border border-[#D8A7B1] p-2.5 text-center shadow-inner mt-auto">
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div>
                    <span className="block font-serif font-bold text-lg sm:text-xl text-[#4A1E28] tabular-nums">
                      {remaining.days}
                    </span>
                    <span className="block text-[8px] sm:text-[9px] uppercase font-mono font-bold text-[#6B2D39]">
                      Hari
                    </span>
                  </div>
                  <div>
                    <span className="block font-serif font-bold text-lg sm:text-xl text-[#4A1E28] tabular-nums">
                      {String(remaining.hours).padStart(2, '0')}
                    </span>
                    <span className="block text-[8px] sm:text-[9px] uppercase font-mono font-bold text-[#6B2D39]">
                      Jam
                    </span>
                  </div>
                  <div>
                    <span className="block font-serif font-bold text-lg sm:text-xl text-[#4A1E28] tabular-nums">
                      {String(remaining.minutes).padStart(2, '0')}
                    </span>
                    <span className="block text-[8px] sm:text-[9px] uppercase font-mono font-bold text-[#6B2D39]">
                      Mnt
                    </span>
                  </div>
                  <div>
                    <span className="block font-serif font-bold text-lg sm:text-xl text-[#6B2D39] tabular-nums">
                      {String(remaining.seconds).padStart(2, '0')}
                    </span>
                    <span className="block text-[8px] sm:text-[9px] uppercase font-mono font-bold text-[#6B2D39]">
                      Dtk
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default EternalCountUp;
