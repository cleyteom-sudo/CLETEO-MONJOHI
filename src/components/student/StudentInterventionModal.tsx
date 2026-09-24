import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Headphones,
  BookOpen,
  PenTool,
  Send,
  Star,
  Award,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InterventionItem, SkillType } from '../../types';
import { playStarChime, playPopChirp, playDropSnap } from '../../utils/soundEffects';

interface StudentInterventionModalProps {
  intervention: InterventionItem;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentInterventionModal: React.FC<StudentInterventionModalProps> = ({
  intervention,
  isOpen,
  onClose,
}) => {
  const { completeStudentIntervention, showToast } = useApp();
  const [reflectionNote, setReflectionNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasPracticed, setHasPracticed] = useState(false);
  const [practiceVoiceText, setPracticeVoiceText] = useState('');
  const [practiceDropAnswer, setPracticeDropAnswer] = useState<string | null>(null);
  const [practiceIsChecking, setPracticeIsChecking] = useState(false);
  const [practiceSuccess, setPracticeSuccess] = useState(false);

  if (!isOpen) return null;

  const getSkillIcon = (skill: SkillType) => {
    switch (skill) {
      case 'Listening':
        return <Headphones className="w-5 h-5 text-emerald-400" />;
      case 'Speaking':
        return <Mic className="w-5 h-5 text-amber-400" />;
      case 'Reading':
        return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'Writing':
        return <PenTool className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-teal-400" />;
    }
  };

  const speakModelAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSimulateVoicePractice = () => {
    setIsRecording(true);
    playPopChirp();
    setTimeout(() => {
      setIsRecording(false);
      setPracticeVoiceText(
        '“For my favourite lunch, I like hot chicken soup with noodles because it is delicious and warms me up.”'
      );
      setHasPracticed(true);
      setPracticeSuccess(true);
      playStarChime();
      showToast('Practice Recorded!', 'Clear pronunciation detected! Ready to submit.', 'success');
    }, 2200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeStudentIntervention(
      intervention.id,
      reflectionNote || practiceVoiceText || 'Completed remediation practice task with high accuracy.'
    );
    onClose();
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[88vh] overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 shrink-0 mt-0.5">
              {getSkillIcon(intervention.skill)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase border border-amber-500/30 tracking-wide">
                  Direct Remedial Intervention
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Target: {intervention.currentTP} ➔ {intervention.targetTP}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                  {intervention.skill}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white">
                {intervention.interventionTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Due Date & Time Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase text-amber-300 tracking-wider">
                  Tarikh & Masa Tamat Tugasan (Due Date & Time)
                </div>
                <div className="text-sm font-black text-white">
                  {intervention.dueDateTime || '25 Sept 2026, 11:59 PM (Today)'}
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase shadow-md shrink-0">
              Action Required
            </span>
          </div>

          {/* Goal & Teacher's Guidance Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>PBD Mastery Target</span>
              </span>
              <span className="text-emerald-400 font-extrabold">
                {intervention.currentTP} ➔ {intervention.targetTP}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Learning Standard Focus:</strong>{' '}
              {intervention.targetDescription}
            </p>
            {intervention.teacherNotes && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-200/90 italic flex items-start gap-2">
                <span className="font-bold text-amber-400 not-italic shrink-0">Cikgu Notes:</span>
                <span>"{intervention.teacherNotes}"</span>
              </div>
            )}
          </div>

          {/* Assigned Activities Checklist */}
          {intervention.activities && intervention.activities.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Langkah-Langkah Remedial (Remedial Action Steps):
              </div>
              <div className="space-y-2">
                {intervention.activities.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Remediation Station */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold uppercase text-white tracking-wider">
                  Interactive Practice Station
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>+50 XP & +3 Stars on Completion</span>
              </span>
            </div>

            {/* Speaking / Audio remediation interactive UI */}
            {intervention.skill === 'Speaking' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold text-amber-300">Model Practice Prompt:</div>
                    <div className="text-xs text-white mt-0.5">
                      “For my favourite lunch, I like hot chicken soup with noodles because it is delicious.”
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      speakModelAudio(
                        'For my favourite lunch, I like hot chicken soup with noodles because it is delicious.'
                      )
                    }
                    className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer shrink-0"
                    title="Dengar Model Sebutan"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-2">
                  <button
                    type="button"
                    onClick={handleSimulateVoicePractice}
                    disabled={isRecording}
                    className={`py-3 px-6 rounded-2xl font-black text-xs inline-flex items-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                      isRecording
                        ? 'bg-red-600 text-white animate-pulse'
                        : hasPracticed
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Merekod Suara Murid...</span>
                      </>
                    ) : hasPracticed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Rekod Semula Jawapan</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Tekan & Cakap Jawapan (2 Ayat Penuh)</span>
                      </>
                    )}
                  </button>
                </div>

                {practiceVoiceText && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Detected Speech:</span> {practiceVoiceText}
                      <div className="text-[10px] text-emerald-400/80 mt-1 font-semibold">
                        Acoustic Pronunciation: 96% Clear • DSKP Target Achieved!
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Listening / Writing remediation fallback */}
            {intervention.skill !== 'Speaking' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <div className="font-bold text-white mb-1">Interactive Diagnostic Exercise:</div>
                  <p>
                    Listen or arrange the remedial prompt to demonstrate mastery of {intervention.skill}{' '}
                    level {intervention.targetTP}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {['Clear', 'Accurate', 'Confident'].map((token, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPracticeDropAnswer(token);
                        setPracticeSuccess(true);
                        playDropSnap();
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        practiceDropAnswer === token
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {token} Mastery
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Student Reflection & Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Catatan Refleksi Murid (Student Reflection / Notes):
              </label>
              <textarea
                value={reflectionNote}
                onChange={(e) => setReflectionNote(e.target.value)}
                placeholder="Tuliskan apa yang anda pelajari atau bagaimana anda meningkatkan kemahiran ini..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal / Simpan Untuk Nanti
              </button>

              <button
                type="submit"
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-102 transition-all cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Hantar & Lengkapkan Intervensi (+50 XP)</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
