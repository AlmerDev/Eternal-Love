import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, KeyRound, Delete, Heart, Sparkles } from 'lucide-react';

interface KeypadLockScreenProps {
  onUnlock: () => void;
  targetPasscode?: string;
}

export const KeypadLockScreen: React.FC<KeypadLockScreenProps> = ({
  onUnlock,
  targetPasscode = '2909',
}) => {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [hintVisible, setHintVisible] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (isSuccess || pin.length >= 4) return;
    const nextPin = pin + num;
    setPin(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === targetPasscode) {
        setIsSuccess(true);
        setTimeout(() => {
          onUnlock();
        }, 1200);
      } else {
        setIsError(true);
        setTimeout(() => {
          setPin('');
          setIsError(false);
        }, 700);
      }
    }
  };

  const handleClear = () => {
    if (isSuccess) return;
    setPin('');
    setIsError(false);
  };

  const handleDeleteLast = () => {
    if (isSuccess) return;
    setPin((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF4F0]"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Curtains / Vintage Arch Background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#F9E2E7] opacity-60 border-2 border-[#D8A7B1]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#F9E2E7] opacity-60 border-2 border-[#D8A7B1]" />
          <div className="absolute top-1/2 left-8 w-24 h-24 border-2 border-dashed border-[#D8A7B1] rounded-full opacity-40 -translate-y-1/2" />
          <div className="absolute top-1/3 right-12 w-16 h-16 border-2 border-dashed border-[#C89D66] rounded-full opacity-40" />
        </div>

        {/* Vintage Scrapbook Paper Card Box */}
        <motion.div
          className={`relative w-full max-w-sm scrapbook-card p-6 sm:p-8 text-[#4A1E28] transition-colors duration-300 ${
            isError ? 'border-red-400 bg-[#FFF5F5]' : isSuccess ? 'border-emerald-500 bg-[#F4FFF8]' : 'bg-[#FFFDF9]'
          }`}
          animate={
            isError
              ? {
                  x: [-12, 12, -8, 8, -4, 4, 0],
                  transition: { duration: 0.5 },
                }
              : isSuccess
              ? {
                  scale: [1, 1.03, 1],
                  transition: { duration: 0.4 },
                }
              : {}
          }
        >
          {/* Scrapbook Tape Accent */}
          <div className="scrapbook-tape" />
          <div className="absolute -top-2 right-4 scrapbook-pin" />

          {/* Header & Lock Status */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#F9E2E7] border-2 border-[#D8A7B1] text-[#6B2D39] mb-3 shadow-inner">
              {isSuccess ? (
                <Unlock className="w-7 h-7 text-[#6B2D39] stroke-[2.2]" />
              ) : (
                <Lock className="w-7 h-7 text-[#6B2D39] stroke-[2.2]" />
              )}
            </div>

            <h1 className="text-2xl font-serif font-bold text-[#4A1E28] tracking-tight">
              Eternal Love
            </h1>
            <p className="text-sm font-cormorant text-[#6B2D39] italic mt-0.5 font-medium">
              Ciyan &amp; Daffa&apos;s Memory Archive
            </p>

            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4F0] border border-[#D8A7B1] text-xs text-[#6B2D39]">
              <KeyRound className="w-3.5 h-3.5 text-[#C89D66]" />
              <span>Masukkan Kode Tanggal Rahasia</span>
            </div>
          </div>

          {/* PIN Digit Indicators */}
          <div className="flex justify-center items-center gap-4 mb-8">
            {[0, 1, 2, 3].map((idx) => {
              const filled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    filled
                      ? isError
                        ? 'bg-red-500 border-red-600 scale-110'
                        : isSuccess
                        ? 'bg-emerald-600 border-emerald-700 scale-125'
                        : 'bg-[#6B2D39] border-[#4A1E28] scale-110 shadow-sm'
                      : 'bg-white border-[#D8A7B1]'
                  }`}
                />
              );
            })}
          </div>

          {/* 10-Key Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-13 rounded-xl bg-[#FAF4F0] hover:bg-[#F9E2E7] active:scale-95 border-2 border-[#D8A7B1] text-[#4A1E28] font-serif font-semibold text-xl transition shadow-[2px_3px_0px_0px_#D8A7B1] flex items-center justify-center cursor-pointer select-none"
              >
                {digit}
              </button>
            ))}

            {/* Clear / Delete Button */}
            <button
              type="button"
              onClick={handleClear}
              className="h-13 rounded-xl bg-[#FAF4F0] hover:bg-[#F9E2E7] active:scale-95 border-2 border-[#D8A7B1] text-[#6B2D39] font-medium text-xs uppercase tracking-wider transition shadow-[2px_3px_0px_0px_#D8A7B1] flex items-center justify-center cursor-pointer"
            >
              Hapus
            </button>

            {/* Zero Digit */}
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-13 rounded-xl bg-[#FAF4F0] hover:bg-[#F9E2E7] active:scale-95 border-2 border-[#D8A7B1] text-[#4A1E28] font-serif font-semibold text-xl transition shadow-[2px_3px_0px_0px_#D8A7B1] flex items-center justify-center cursor-pointer select-none"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleDeleteLast}
              className="h-13 rounded-xl bg-[#FAF4F0] hover:bg-[#F9E2E7] active:scale-95 border-2 border-[#D8A7B1] text-[#6B2D39] transition shadow-[2px_3px_0px_0px_#D8A7B1] flex items-center justify-center cursor-pointer"
              aria-label="Hapus Satu Karakter"
            >
              <Delete className="w-5 h-5 text-[#6B2D39]" />
            </button>
          </div>

          {/* Secret Hint Accordion */}
          <div className="mt-4 pt-3 border-t border-dashed border-[#D8A7B1] text-center">
            <button
              type="button"
              onClick={() => setHintVisible(!hintVisible)}
              className="inline-flex items-center gap-1.5 text-xs text-[#6B2D39] hover:text-[#4A1E28] underline underline-offset-4 cursor-pointer font-cormorant"
            >
              <Heart className="w-3.5 h-3.5 text-[#C89D66] fill-[#C89D66]/20" />
              <span>{hintVisible ? 'Tutup Petunjuk' : 'Lupa kodenya? Lihat Petunjuk'}</span>
            </button>

            {hintVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2.5 p-3 rounded-xl bg-[#F9E2E7] border border-[#D8A7B1] text-xs text-[#4A1E28] font-serif"
              >
                <div className="flex items-center justify-center gap-1 text-[#6B2D39] font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C89D66]" />
                  <span>Petunjuk Cinta:</span>
                </div>
                <p>
                  Tanggal resmi kita berdua jadian di bulan September (Format: <strong>2909</strong>).
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
export default KeypadLockScreen;
