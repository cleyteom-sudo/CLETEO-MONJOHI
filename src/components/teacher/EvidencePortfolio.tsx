import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FolderOpen,
  Filter,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Image as ImageIcon,
  Mic,
  PenTool,
  FileText,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EvidenceItem, SkillType, TPLevel } from '../../types';

export const EvidencePortfolio: React.FC = () => {
  const { evidenceList, validateEvidence, students } = useApp();

  const [skillFilter, setSkillFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio play simulation state
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Reviewing modal state
  const [reviewingItem, setReviewingItem] = useState<EvidenceItem | null>(null);
  const [selectedTP, setSelectedTP] = useState<TPLevel>('TP4');
  const [feedback, setFeedback] = useState('Clear pronunciation with good sentence structure.');

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesSkill = skillFilter === 'All' || item.skill === skillFilter;
    const matchesStatus = statusFilter === 'All' || item.teacherStatus === statusFilter;
    const matchesSearch =
      !searchQuery ||
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.activityTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSkill && matchesStatus && matchesSearch;
  });

  const handleOpenReview = (item: EvidenceItem) => {
    setReviewingItem(item);
    setSelectedTP(item.validatedTP || item.aiSuggestedTP || 'TP4');
    setFeedback(item.teacherFeedback || 'Good effort. Keep practicing sentence starters.');
  };

  const handleConfirmValidation = () => {
    if (!reviewingItem) return;
    validateEvidence(reviewingItem.id, selectedTP, feedback);
    setReviewingItem(null);
  };

  const togglePlayAudio = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Digital Evidence & Learning Repository
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {evidenceList.length} Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Classroom voice clips, handwriting uploads, drawing canvas projects, and teacher validation audit logs.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search evidence by pupil or activity..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          >
          </input>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Skill:</span>
          {['All', 'Speaking', 'Reading', 'Writing', 'Listening'].map((s) => (
            <button
              key={s}
              onClick={() => setSkillFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                skillFilter === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Status:</span>
          {['All', 'Pending Review', 'Teacher Validated'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvidence.map((item, idx) => {
          const isValidated = item.teacherStatus === 'Teacher Validated';

          return (
            <div
              key={item.id ? `${item.id}-${idx}` : `ev-${idx}`}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isValidated
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-amber-950/20 border-amber-800/50 shadow-lg shadow-amber-500/5'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {item.skill}
                    </span>
                    <h3 className="font-extrabold text-white text-sm mt-1.5 line-clamp-1">
                      {item.activityTitle}
                    </h3>
                    <p className="text-xs text-cyan-300 font-semibold">{item.studentName}</p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 border ${
                      isValidated
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    }`}
                  >
                    {item.teacherStatus}
                  </span>
                </div>

                {/* Evidence Content Preview */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-4">
                  {item.evidenceType === 'audio' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Mic className="w-4 h-4 text-red-400" />
                        <span>Voice Recording ({item.audioDuration || '0:35'})</span>
                      </div>
                      <button
                        onClick={() => togglePlayAudio(item.id)}
                        className={`p-2 rounded-xl text-white transition-all ${
                          playingId === item.id ? 'bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                      >
                        {playingId === item.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : item.imageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={item.imageUrl}
                        alt="Worksheet"
                        className="w-full h-32 object-cover rounded-lg border border-slate-800"
                      />
                      <p className="text-[11px] text-slate-300 line-clamp-2">{item.textContent}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 italic line-clamp-3">
                      “{item.textContent || 'Digital response captured.'}”
                    </p>
                  )}
                </div>

                {/* AI Suggestion vs Teacher Validation */}
                <div className="space-y-2 mb-4 text-xs">
                  {item.aiSuggestedTP && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-950/40 border border-blue-900/40 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        AI Suggested Baseline:
                      </span>
                      <span className="font-bold text-cyan-300">{item.aiSuggestedTP}</span>
                    </div>
                  )}

                  {isValidated && (
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/40 text-[11px]">
                      <div className="flex items-center justify-between font-bold text-emerald-300 mb-0.5">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Teacher Validated TP:
                        </span>
                        <span>{item.validatedTP}</span>
                      </div>
                      {item.teacherFeedback && (
                        <p className="text-slate-300 text-[10px] mt-1 italic">
                          "{item.teacherFeedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>{item.date}</span>
                <button
                  onClick={() => handleOpenReview(item)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    isValidated
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md'
                  }`}
                >
                  {isValidated ? 'Edit Validation' : 'Review & Validate TP'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* TEACHER VALIDATION WORKFLOW MODAL (Prompt Requirement #16) */}
      {reviewingItem && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  Teacher Judgement Workflow
                </span>
                <h3 className="text-lg font-black text-white mt-1">Review Digital Evidence</h3>
                <p className="text-xs text-cyan-300">
                  {reviewingItem.studentName} • {reviewingItem.activityTitle}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            {/* Evidence details */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-4">
              <span className="font-bold text-white block mb-1">Submitted Content:</span>
              <p className="italic">
                {reviewingItem.textContent || 'Classroom voice recording sample.'}
              </p>
            </div>

            {/* Assign / Adjust TP */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Official PBD Tahap Penguasaan (TP):
              </label>
              <div className="grid grid-cols-6 gap-2">
                {(['TP1', 'TP2', 'TP3', 'TP4', 'TP5', 'TP6'] as TPLevel[]).map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setSelectedTP(tp)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedTP === tp
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tp}
                  </button>
                ))}
              </div>
            </div>

            {/* Teacher Feedback Note */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Teacher Professional Feedback Note:
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReviewingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmValidation}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM TEACHER TP ({selectedTP})</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
