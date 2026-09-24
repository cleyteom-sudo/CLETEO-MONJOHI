import React, { useState } from 'react';
import {
  History,
  BookOpen,
  Mic,
  PenTool,
  Headphones,
  Star,
  CheckCircle2,
  Calendar,
  Cloud,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SkillType, TaskHistoryItem } from '../../types';
import { GoogleDriveSyncModal } from '../common/GoogleDriveSyncModal';

export const StudentTaskHistoryView: React.FC = () => {
  const { currentStudent, taskHistory, setCurrentView } = useApp();
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');
  const [showDriveModal, setShowDriveModal] = useState(false);

  const studentHistory = taskHistory.filter(
    (item: TaskHistoryItem) => !item.studentId || item.studentId === currentStudent?.id || item.studentId === 'std-daniel-lee'
  );

  const filteredHistory = selectedSkillFilter === 'All'
    ? studentHistory
    : studentHistory.filter((item: TaskHistoryItem) => item.skill === selectedSkillFilter);

  const totalStars = studentHistory.reduce((acc: number, curr: TaskHistoryItem) => acc + (curr.starsEarned || 0), 0);
  const totalTasks = studentHistory.length;

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'Reading':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'Speaking':
        return <Mic className="w-4 h-4 text-amber-400" />;
      case 'Writing':
        return <PenTool className="w-4 h-4 text-purple-400" />;
      case 'Listening':
        return <Headphones className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getSkillBadgeColor = (skill: string) => {
    switch (skill) {
      case 'Reading':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Speaking':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Writing':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Listening':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-xs uppercase border border-cyan-500/30 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Full Activity & Submission Ledger</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            📜 My Learning Task History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Review all completed exercises, recorded audio transcripts, teacher corrections, and stars earned across all skills.
          </p>
        </div>

        {/* Quick Stats & Cloud Backup */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
            <div className="text-xs text-slate-400 font-bold">Total Tasks</div>
            <div className="text-xl font-black text-white">{totalTasks}</div>
            <div className="text-[10px] text-emerald-400 font-bold">Completed ✓</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
            <div className="text-xs text-slate-400 font-bold">Stars Earned</div>
            <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <span>{totalStars}</span>
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div className="text-[10px] text-amber-300/80 font-bold">Reward History</div>
          </div>
          <button
            onClick={() => setShowDriveModal(true)}
            className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Cloud className="w-4 h-4" />
            <span>Sync to Google Drive</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {['All', 'Reading', 'Speaking', 'Writing', 'Listening', 'Diagnostic'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedSkillFilter(tab)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedSkillFilter === tab
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            {tab !== 'All' && getSkillIcon(tab)}
            <span>{tab}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/60 ml-0.5">
              {tab === 'All'
                ? studentHistory.length
                : studentHistory.filter((i: TaskHistoryItem) => i.skill === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-3">
            <History className="w-10 h-10 mx-auto text-slate-600" />
            <div className="text-base font-bold text-white">No completed tasks in this category yet.</div>
            <p className="text-xs max-w-sm mx-auto">
              Start an exercise in Reading Island, Speaking Arena, Writing Workshop, or Listening Bay to record your history!
            </p>
          </div>
        ) : (
          filteredHistory.map((item: TaskHistoryItem) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 ${getSkillBadgeColor(
                      item.skill
                    )}`}
                  >
                    {getSkillIcon(item.skill)}
                    <span>{item.skill}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{item.category}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>+{item.starsEarned} Stars</span>
                  </span>
                  <span className="text-purple-300 font-bold">+{item.xpEarned} XP</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>{item.completedAt}</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-white">{item.taskTitle}</h3>
                <div className="mt-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Student Submission / Recorded Speech:
                  </div>
                  <p className="italic text-slate-200">"{item.userInputSummary}"</p>
                </div>
              </div>

              {/* Feedback & Teacher Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
                  <span className="font-bold text-cyan-300 block mb-0.5">Evaluation & Feedback:</span>
                  {item.feedbackSummary}
                </div>
                {item.teacherRemarks && (
                  <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                    <span className="font-bold text-indigo-300 block mb-0.5">Teacher Remarks:</span>
                    {item.teacherRemarks}
                  </div>
                )}
              </div>

              {/* Red-Underlined Corrections Preview if applicable */}
              {item.corrections && item.corrections.length > 0 && (
                <div className="p-3 rounded-2xl bg-red-950/20 border border-red-500/30 text-xs text-red-200 space-y-2">
                  <span className="font-bold text-red-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Corrections Reviewed ({item.corrections.length}):</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.corrections.map((corr: any, cIdx: number) => (
                      <div
                        key={cIdx}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 border border-red-500/40 text-[11px]"
                      >
                        <span className="line-through text-red-400 mr-1.5">"{corr.errorWord}"</span>
                        <span className="text-emerald-400 font-bold">➔ "{corr.correction}"</span>
                        <span className="text-slate-400 text-[10px] ml-1.5">({corr.explanation})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{item.status}</span>
                </span>
                <span className="font-bold text-slate-300">Score: {item.score}%</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Google Drive Sync Modal */}
      <GoogleDriveSyncModal isOpen={showDriveModal} onClose={() => setShowDriveModal(false)} />
    </div>
  );
};
