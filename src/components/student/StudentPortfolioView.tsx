import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Mic,
  PenTool,
  QrCode,
  Share2,
  Printer,
  Sparkles,
  ShieldCheck,
  Play,
  Pause,
  ExternalLink,
  Star,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TranslateBMButton } from '../common/TranslateBMButton';
import { StudentGrowthSummary } from './StudentGrowthSummary';

export const StudentPortfolioView: React.FC = () => {
  const { currentStudent, students, setSelectedStudentId, evidenceList, setQrModalStudent, setCurrentView } = useApp();
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const student = currentStudent || {
    id: 'std-3',
    name: 'Daniel Lee',
    className: '4 BESTARI',
    year: 4,
    level: 4,
    levelTitle: 'Word Explorer',
    xp: 1240,
    readingTP: 'TP3',
    writingTP: 'TP3',
    listeningTP: 'TP4',
    speakingTP: 'TP3',
    overallTP: 'TP3',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badges: [
      { id: 'b1', title: 'First Sentence Master', icon: '🏆', unlocked: true },
      { id: 'b2', title: 'Brave Speaker', icon: '🎙️', unlocked: true },
      { id: 'b3', title: 'Word Explorer', icon: '📚', unlocked: true },
      { id: 'b4', title: 'Grammar Hero', icon: '🎯', unlocked: true },
    ],
  };

  const myEvidence = evidenceList.filter((e) => e.studentId === student.id || e.studentName === student.name);

  const toggleAudio = (id: string) => {
    setPlayingAudioId(playingAudioId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header with Parent QR Trigger */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Personal Learning Showcase
            </span>
            <span className="text-xs text-slate-400">Class: {student.className}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Digital Learning Portfolio
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs sm:text-sm text-slate-300">
              Showcase your best speaking audio clips, creative drawings, and teacher-validated PBD milestones.
            </p>
            <TranslateBMButton
              englishText="Showcase your best speaking audio clips, creative drawings, and teacher-validated PBD milestones."
              bmTranslation="Paparan pencapaian rakaman suara, lukisan kreatif dan tahap penguasaan PBD yang telah disahkan oleh guru anda."
              tipsBM="Ibu bapa anda boleh imbas kod QR untuk melihat portfolio ini di rumah."
            />
          </div>

          {/* Student Profile Switcher */}
          {students && students.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-purple-500/20">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Viewing Student:
              </span>
              <select
                id="portfolio-student-selector"
                value={student.id}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-950 border border-purple-500/40 text-purple-200 text-xs rounded-xl px-3 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer shadow-inner"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name} ({s.className} • Overall {s.overallTP})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setSelectedStudentId(student.id);
              setCurrentView('parent-summary');
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl shadow-emerald-500/25 transition-all cursor-pointer hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>CETAK SLIP IBU BAPA</span>
          </button>

          <button
            onClick={() => setQrModalStudent(student as any)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-500/25 transition-all cursor-pointer hover:scale-105"
          >
            <QrCode className="w-4 h-4" />
            <span>KOD QR IBU BAPA</span>
          </button>
        </div>
      </div>

      {/* Overview Cards: Badges & TP Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PBD Milestone */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md text-center flex flex-col justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Validated Overall PBD
          </span>
          <div className="text-5xl font-black text-cyan-300 my-4">{student.overallTP}</div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Teacher Validated Record</span>
          </div>
        </div>

        {/* 4 Skills Radar */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Competency by Skill & Virtual Star Count
            </h3>
            <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{(student as any).stars || 14} Total Stars Earned</span>
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                skill: 'Reading',
                tp: student.readingTP,
                icon: BookOpen,
                color: 'text-blue-400',
                stars: (student as any).starsBreakdown?.reading || 6,
              },
              {
                skill: 'Writing',
                tp: student.writingTP,
                icon: PenTool,
                color: 'text-purple-400',
                stars: (student as any).starsBreakdown?.writing || 2,
              },
              {
                skill: 'Listening',
                tp: student.listeningTP,
                icon: BookOpen,
                color: 'text-emerald-400',
                stars: (student as any).starsBreakdown?.listening || 1,
              },
              {
                skill: 'Speaking',
                tp: student.speakingTP,
                icon: Mic,
                color: 'text-amber-400',
                stars: (student as any).starsBreakdown?.speaking || 5,
              },
            ].map((item) => (
              <div key={item.skill} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
                <div className="text-xs text-slate-400 font-semibold">{item.skill}</div>
                <div className="text-xl font-black text-white mt-0.5">{item.tp}</div>
                <div className="mt-1 text-[11px] font-bold text-amber-400 flex items-center justify-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{item.stars} ⭐</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Performance Growth Charts Section */}
      <StudentGrowthSummary student={student as any} />

      {/* Best Work & Digital Evidence Items */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-white">My Work & Audio Artifacts</h3>
            <p className="text-xs text-slate-400">Classroom activities reviewed by Teacher</p>
          </div>
          <span className="text-xs text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
            {myEvidence.length} Items Saved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myEvidence.map((item, idx) => (
            <div
              key={item.id ? `${item.id}-${idx}` : `ev-${idx}`}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {item.skill}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
              </div>

              <h4 className="font-extrabold text-sm text-white">{item.activityTitle}</h4>

              {item.evidenceType === 'audio' ? (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mic className="w-4 h-4 text-red-400" />
                    <span>Audio Clip ({item.audioDuration || '0:35'})</span>
                  </div>
                  <button
                    onClick={() => toggleAudio(item.id)}
                    className={`p-2 rounded-xl text-white ${
                      playingAudioId === item.id ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                    }`}
                  >
                    {playingAudioId === item.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt="Work"
                  className="w-full h-32 object-cover rounded-xl border border-slate-800"
                />
              ) : (
                <p className="text-xs text-slate-300 italic line-clamp-3">“{item.textContent}”</p>
              )}

              {/* Teacher Feedback Note */}
              {item.teacherFeedback && (
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-emerald-200">
                  <span className="font-bold block text-emerald-400">Teacher's Note:</span>
                  <span>"{item.teacherFeedback}"</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
