import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  BookOpen,
  PenTool,
  Headphones,
  Mic,
  TrendingUp,
  Award,
  Calendar,
  ShieldCheck,
  Sparkles,
  QrCode,
  FileText,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Printer,
  Activity,
} from 'lucide-react';
import { Student, TPLevel } from '../../types';
import { useApp } from '../../context/AppContext';

export const StudentProfileModal: React.FC<{
  student: Student | null;
  onClose: () => void;
  onAssignIntervention: (student: Student) => void;
}> = ({ student, onClose, onAssignIntervention }) => {
  const { evidenceList, setQrModalStudent, setSelectedStudentId, setCurrentView } = useApp();

  if (!student) return null;

  const studentEvidence = evidenceList.filter((e) => e.studentId === student.id);

  const tpWeights: Record<TPLevel, number> = {
    TP1: 1,
    TP2: 2,
    TP3: 3,
    TP4: 4,
    TP5: 5,
    TP6: 6,
  };

  const skills = [
    { name: 'Reading', tp: student.readingTP, validated: student.readingValidated, icon: BookOpen, color: 'from-blue-500 to-indigo-600' },
    { name: 'Writing', tp: student.writingTP, validated: student.writingValidated, icon: PenTool, color: 'from-purple-500 to-pink-600' },
    { name: 'Listening', tp: student.listeningTP, validated: student.listeningValidated, icon: Headphones, color: 'from-emerald-500 to-teal-600' },
    { name: 'Speaking', tp: student.speakingTP, validated: student.speakingValidated, icon: Mic, color: 'from-red-500 to-orange-500', isWeak: student.speakingTP === 'TP2' || student.speakingTP === 'TP3' },
  ];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{student.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {student.className}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{student.email} • Year {student.year} Primary</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-amber-300">Level {student.level}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-bold text-purple-300">⭐ {student.xp} XP</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-bold text-orange-300">🔥 {student.streakDays} Day Streak</span>
              </div>
            </div>
          </div>

          {/* Overall TP Card */}
          <div className="flex sm:flex-col items-center justify-between sm:justify-center p-3 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-br from-blue-600/30 to-indigo-600/20 border border-blue-500/40 text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300">
              Overall PBD
            </span>
            <div className="text-3xl font-black text-white my-0.5">{student.overallTP}</div>
            <span className="text-[10px] text-cyan-300 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Teacher Validated
            </span>
          </div>
        </div>

        {/* 4 Skill TP Breakdown with Progress Bars */}
        <div className="py-6">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
            Tahap Penguasaan (TP) by Skill
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((skill) => {
              const Icon = skill.icon;
              const weight = tpWeights[skill.tp];
              const pct = (weight / 6) * 100;

              return (
                <div
                  key={skill.name}
                  className={`p-4 rounded-xl border ${
                    skill.isWeak
                      ? 'bg-red-950/20 border-red-900/50'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-xs text-white">{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-cyan-300">{skill.tp}</span>
                      {skill.validated ? (
                        <span title="Teacher Validated"><ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /></span>
                      ) : (
                        <span title="AI Suggestion"><Sparkles className="w-3.5 h-3.5 text-amber-400" /></span>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{skill.validated ? 'Teacher Validated' : 'AI Suggestion'}</span>
                    {skill.isWeak ? (
                      <span className="text-red-400 font-bold">⚠️ Needs Practice</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Good Progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend Progress (Prompt Requirement: JUNE -> TP2, JULY -> TP3, AUGUST -> TP3) */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Historical PBD Progress Trend
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">Continuous Growth</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            {student.historicalTP?.map((item, idx) => (
              <div key={idx} className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-[10px] font-bold uppercase text-slate-400">{item.month}</div>
                <div className="text-xl font-black text-white my-0.5">{item.tp}</div>
                <div className="text-[10px] text-cyan-400">Validated Record</div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Evidence Attached for Daniel */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-300">
              Submitted Digital Evidence ({studentEvidence.length} Items)
            </span>
          </div>

          <div className="space-y-2">
            {studentEvidence.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{ev.activityTitle}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                      {ev.skill}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {ev.textContent || 'Audio file attached (0:42)'}
                  </p>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {ev.date} • {ev.time}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {ev.teacherStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedStudentId(student.id);
                onClose();
                setCurrentView('parent-summary');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
              title="Cetak Slip Rekod PBD Ibu Bapa"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Slip Ibu Bapa</span>
            </button>

            <button
              onClick={() => {
                setSelectedStudentId(student.id);
                onClose();
                setCurrentView('student-activity-log');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
              title="Lihat Log Aktiviti Murid"
            >
              <Activity className="w-4 h-4" />
              <span>Log Aktiviti</span>
            </button>

            <button
              onClick={() => setQrModalStudent(student)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Kod QR</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAssignIntervention(student)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-red-500/20 transition-all cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Assign Guided Intervention</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
