import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Heart, Camera, Sparkles, X, ZoomIn } from 'lucide-react';
import { Photo } from '../../types/database';

interface PDKTSectionProps {
  photos: Photo[];
}

export const PDKTSection: React.FC<PDKTSectionProps> = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const pdktPhotos = photos.filter((p) => p.category === 'pdkt');

  return (
    <section id="pdkt-story" className="relative my-16 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] mb-3">
          <Camera className="w-4 h-4 text-[#C89D66]" />
          <span>Timeline Kisah PDKT Kita</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#4A1E28]">
          Jejak Langkah Menuju 29 September
        </h2>
        <p className="mt-2 text-base font-cormorant text-[#6B2D39] italic font-medium">
          Setiap momen perkenalan yang canggung, tatapan malu-malu, hingga rasa yang perlahan bermekaran abadi.
        </p>
      </div>

      {/* Vertical Scrapbook Timeline & Grid Cards */}
      <div className="relative max-w-5xl mx-auto">
        {/* Vintage Timeline Center Spine (Desktop) */}
        <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-[#D8A7B1]" />

        <div className="space-y-12 sm:space-y-16">
          {pdktPhotos.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center ${
                  isEven ? 'md:flex-row-reverse' : ''
                } gap-6 md:gap-12`}
              >
                {/* Center Pin Node (Desktop) */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FFFDF9] border-2 border-[#C89D66] items-center justify-center z-20 shadow-md">
                  <div className="w-3 h-3 rounded-full bg-[#6B2D39]" />
                </div>

                {/* Content Side / Timeline Card */}
                <div className="w-full md:w-1/2">
                  <div
                    onClick={() => setSelectedPhoto(item)}
                    className="relative scrapbook-card p-5 sm:p-6 cursor-pointer group hover:-translate-y-1 transition-transform duration-300"
                    style={{
                      transform: `rotate(${item.rotation || (isEven ? -1 : 1)}deg)`,
                    }}
                  >
                    {/* Washi Tape Header */}
                    <div className="scrapbook-tape" />
                    <div className="absolute top-2 right-3 scrapbook-pin" />

                    {/* Polaroid-style Photo Frame */}
                    <div className="relative overflow-hidden rounded-lg border-2 border-[#D8A7B1] bg-[#FAF4F0] mb-4 aspect-[4/3]">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-[#4A1E28]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="p-2 rounded-full bg-[#FFFDF9] border border-[#D8A7B1] text-[#6B2D39] shadow-md">
                          <ZoomIn className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Date & Location Pill Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39]">
                        <Calendar className="w-3.5 h-3.5 text-[#C89D66]" />
                        {item.date}
                      </span>

                      {item.location && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF4F0] border border-[#D8A7B1] text-[#6B2D39]">
                          <MapPin className="w-3.5 h-3.5 text-[#6B2D39]" />
                          {item.location}
                        </span>
                      )}
                    </div>

                    {/* Title & Caption */}
                    <h3 className="font-serif font-bold text-xl text-[#4A1E28] mb-1.5 group-hover:text-[#6B2D39] transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-cormorant text-sm leading-relaxed text-[#4A1E28]/90 font-medium">
                      {item.caption}
                    </p>

                    <div className="mt-3 pt-3 border-t border-dashed border-[#D8A7B1] flex items-center justify-between text-xs text-[#6B2D39]">
                      <span className="inline-flex items-center gap-1 font-script text-base">
                        <Heart className="w-3.5 h-3.5 text-[#C89D66] fill-[#C89D66]/20" />
                        Lembaran Memori PDKT
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#C89D66]">
                        Klik untuk Memperbesar
                      </span>
                    </div>
                  </div>
                </div>

                {/* Empty Half to preserve 50-50 balance on desktop */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal View */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A1E28]/60"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-2xl scrapbook-card p-6 sm:p-8 bg-[#FFFDF9] border-2 border-[#D8A7B1] text-[#4A1E28] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="scrapbook-tape" />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#FAF4F0] hover:bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39] transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mt-4 rounded-xl overflow-hidden border-2 border-[#D8A7B1] bg-[#FAF4F0] max-h-[60vh]">
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain max-h-[55vh] mx-auto"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39]">
                  <Calendar className="w-3.5 h-3.5 text-[#C89D66]" />
                  {selectedPhoto.date}
                </span>
                {selectedPhoto.location && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF4F0] border border-[#D8A7B1] text-[#6B2D39]">
                    <MapPin className="w-3.5 h-3.5 text-[#6B2D39]" />
                    {selectedPhoto.location}
                  </span>
                )}
              </div>

              <h3 className="font-serif font-bold text-2xl text-[#4A1E28] mb-2">
                {selectedPhoto.title}
              </h3>
              <p className="font-cormorant text-base leading-relaxed text-[#4A1E28]/95 font-medium">
                {selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
export default PDKTSection;
