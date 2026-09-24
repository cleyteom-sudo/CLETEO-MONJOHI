import React, { useState } from 'react';
import { Languages, ChevronDown, ChevronUp, Volume2, Sparkles } from 'lucide-react';

interface TranslateBMButtonProps {
  englishText: string;
  bmTranslation: string;
  tipsBM?: string;
  compact?: boolean;
}

export const TranslateBMButton: React.FC<TranslateBMButtonProps> = ({
  englishText,
  bmTranslation,
  tipsBM,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="inline-block relative">
      {/* Small Box Button for Translate */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
          isOpen
            ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm'
            : 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border-amber-500/30 hover:border-amber-400/60'
        }`}
        title="Terjemah arahan tugasan ke Bahasa Melayu untuk murid"
      >
        <Languages className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Terjemah BM</span>
        {isOpen ? (
          <ChevronUp className="w-3 h-3 text-amber-400" />
        ) : (
          <ChevronDown className="w-3 h-3 text-amber-400" />
        )}
      </button>

      {/* Translation Popup Card */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-40 w-72 sm:w-84 p-3 rounded-xl bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bantuan Bahasa Melayu (BM)</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              Panduan Murid
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Maksud Tugasan:
              </span>
              <p className="text-white font-medium leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                {bmTranslation}
              </p>
            </div>

            {tipsBM && (
              <div className="text-[11px] text-amber-200/90 bg-amber-950/30 p-2 rounded-lg border border-amber-800/40">
                <span className="font-bold text-amber-400">💡 Tip Guru: </span>
                {tipsBM}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
