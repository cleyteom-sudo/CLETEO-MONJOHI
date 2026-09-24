import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import {
  Star,
  Award,
  Sparkles,
  Volume2,
  CheckCircle2,
  X,
  BookOpen,
  Mic,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { playStarChime, playBadgeFanfare, speakPraiseEncouragement } from '../../utils/soundEffects';
import { SkillType } from '../../types';

export interface StarCelebrationPayload {
  title: string;
  praiseMessage: string;
  starsCount: number;
  xpEarned: number;
  skill: SkillType;
  exerciseTitle: string;
  badgeUnlocked?: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
  studentName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: StarCelebrationPayload | null;
  onNavigateToCollection?: () => void;
}

export const StarBadgeCelebrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  onNavigateToCollection,
}) => {
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    if (!isOpen || !data) return;

    // Trigger visual confetti
    try {
      confetti({
        particleCount: data.badgeUnlocked ? 120 : 80,
        spread: 90,
        origin: { y: 0.45 },
        colors: ['#F59E0B', '#FBBF24', '#38BDF8', '#818CF8', '#10B981', '#EC4899'],
      });
    } catch {
      // safe fallback
    }

    // Play pleasant Web Audio chime / fanfare
    if (data.badgeUnlocked) {
      playBadgeFanfare();
    } else {
      playStarChime();
    }

    // Auto-speak short child-friendly encouragement once
    const cheer = `Awesome job ${data.studentName || 'there'}! ${data.title}. You earned ${data.starsCount} star${
      data.starsCount > 1 ? 's' : ''
    }!`;
    speakPraiseEncouragement(cheer);
    setHasSpoken(true);
  }, [isOpen, data]);

  if (!isOpen || !data) return null;
  if (typeof document === 'undefined') return null;

  const isReading = data.skill === 'Reading';
  const isSpeaking = data.skill === 'Speaking';

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-center overflow-hidden animate-in zoom-in-95 duration-200 my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Skill Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 border shadow-sm ${
          isReading
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            : isSpeaking
            ? 'bg-red-500/20 text-amber-300 border-amber-500/40'
            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
        }">
          {isReading ? (
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>
            {data.skill} Exercise Reward • {data.exerciseTitle}
          </span>
        </div>

        {/* Star Burst Visuals */}
        <div className="relative my-3 flex items-center justify-center gap-3">
          {Array.from({ length: Math.min(Math.max(data.starsCount, 1), 5) }).map((_, idx) => (
            <div
              key={idx}
              className="relative transform transition-all duration-300 hover:scale-125 cursor-pointer"
              style={{
                animation: `bounce 1s ease-in-out infinite`,
                animationDelay: `${idx * 0.15}s`,
              }}
              onClick={() => playStarChime()}
              title="Click to hear star chime!"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/40 border border-yellow-200">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white drop-shadow-md" />
              </div>
              <Sparkles className="w-4 h-4 text-amber-200 absolute -top-1 -right-1 animate-ping" />
            </div>
          ))}
        </div>

        {/* Celebratory Title & Praise */}
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-tight mt-3">
          {data.title}
        </h2>

        <p className="text-sm sm:text-base text-slate-200 font-medium mt-2 leading-relaxed px-2">
          {data.praiseMessage}
        </p>

        {/* Audio Praise Replay Button */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            onClick={() => {
              const cheer = `Awesome job ${data.studentName || 'there'}! ${data.title}. ${data.praiseMessage}`;
              speakPraiseEncouragement(cheer);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700 transition-colors"
            title="Listen to encouragement"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hear Praise Again</span>
          </button>
        </div>

        {/* Badge Unlocked Card (If Applicable) */}
        {data.badgeUnlocked && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 text-left flex items-center gap-4 animate-in slide-in-from-bottom-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30 shrink-0">
              {data.badgeUnlocked.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                New Badge Unlocked! 🏆
              </span>
              <h4 className="text-base font-black text-white truncate mt-0.5">
                {data.badgeUnlocked.name}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-1">{data.badgeUnlocked.description}</p>
            </div>
          </div>
        )}

        {/* Rewards Summary Box */}
        <div className="mt-5 grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
          <div className="text-center p-2 rounded-xl bg-slate-900/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Stars Added</span>
            <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400" /> +{data.starsCount} Star{data.starsCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-900/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">XP Reward</span>
            <span className="text-lg font-black text-purple-400 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-400" /> +{data.xpEarned} XP
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>CLAIM STARS & KEEP LEARNING</span>
          </button>

          {onNavigateToCollection && (
            <button
              onClick={() => {
                onClose();
                onNavigateToCollection();
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>View Badges & Stars</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
