import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Flame,
  Award,
  BookOpen,
  PenTool,
  Headphones,
  Mic,
  ArrowRight,
  CheckCircle2,
  Lock,
  Star,
  Trophy,
  Palette,
  Compass,
  Printer,
  History,
  Cloud,
  Check,
  Bell,
  Clock,
  AlertTriangle,
  TrendingUp,
  Gamepad2,
  Swords,
  ChevronRight,
  Move,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PersonaliseProfileModal } from '../common/PersonaliseProfileModal';
import { GoogleDriveSyncModal } from '../common/GoogleDriveSyncModal';
import { StudentNotificationModal } from './StudentNotificationModal';
import { playBadgeFanfare, playStarChime, playPopChirp } from '../../utils/soundEffects';

export const StudentWorld: React.FC = () => {
  const {
    currentStudent,
    setCurrentView,
    triggerCelebration,
    showToast,
    claimMissionReward,
    badges,
    taskHistory,
    studentNotifications,
    openStudentInterventionById,
  } = useApp();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeRewardTab, setActiveRewardTab] = useState<'badges' | 'stars'>('badges');
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<any | null>(null);

  const student = currentStudent || {
    id: 'std-daniel-lee',
    name: 'Daniel Lee',
    className: '4 BESTARI',
    year: 4,
    level: 7,
    xp: 350,
    streakDays: 5,
    weeklyMissionsCompleted: 3,
    totalWeeklyMissions: 4,
    isFirstTimerCompleted: true,
    completedTaskIds: ['read-story-1', 'spk-mission-1', 'wri-mission-1', 'list-task-1'],
    avatarUrl:
      'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
    badges: ['badge-reading-explorer', 'badge-brave-speaker', 'badge-listening-detective'],
    stars: 14,
    starsBreakdown: {
      reading: 6,
      speaking: 5,
      writing: 2,
      listening: 1,
    },
    earnedStarHistory: [],
  };

  const levelTitle =
    student.level >= 5 ? 'Grammar Hero' : student.level === 4 ? 'Word Explorer' : 'Sentence Builder';
  const totalMissions = student.totalWeeklyMissions || 5;
  const isFirstTimerDone = student.isFirstTimerCompleted ?? true;

  const avatars = [
    'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  ];

  const handleBadgeClick = (badge: any, isUnlocked: boolean) => {
    if (isUnlocked) {
      playBadgeFanfare();
      setSelectedBadgeModal(badge);
    } else {
      showToast('Badge Locked 🔒', `Complete more ${badge.category} exercises to unlock this badge!`, 'info');
    }
  };

  const studentBadgesList = student.badges || [];
  const studentStars = student.stars || 14;
  const starHistory = student.earnedStarHistory || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Student Profile Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Avatar and Basic Details */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative group">
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/20 group-hover:scale-105 transition-transform"
              />
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 hover:text-white shadow cursor-pointer"
                title="Change Avatar"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>

              {showAvatarPicker && (
                <div className="absolute top-full left-0 mt-3 p-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-30 flex gap-2">
                  {avatars.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="avatar option"
                      onClick={() => setShowAvatarPicker(false)}
                      className="w-10 h-10 rounded-xl object-cover cursor-pointer hover:border-2 hover:border-cyan-400"
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-[11px] border border-cyan-500/30">
                  {student.className || '4 BESTARI'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Primary English Cadet • {levelTitle} (Level {student.level})
              </p>

              {/* XP, Streak & Stars Quick Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{student.xp} XP</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{studentStars} Stars Earned</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>{student.streakDays} Day Streak</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Hub: Google Drive & History */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowDriveModal(true)}
              className="py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
              <span>Google Drive Backup</span>
            </button>
            <button
              onClick={() => setCurrentView('task-history')}
              className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Task History</span>
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="py-2.5 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
              title="Change Theme & Background"
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly Mission Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-300">
              Weekly Mission Progress: {student.weeklyMissionsCompleted} of {totalMissions} Completed
            </span>
            <button
              onClick={() => {
                claimMissionReward();
                triggerCelebration();
              }}
              className="text-[11px] font-bold text-cyan-300 hover:text-white underline cursor-pointer"
            >
              Claim +50 XP Completion Bonus
            </button>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(student.weeklyMissionsCompleted / totalMissions) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 1st Timer Cadet Diagnostic Banner (Mandatory Step-by-Step Guide) */}
      <div
        onClick={() => setCurrentView('first-timer')}
        className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          !isFirstTimerDone
            ? 'bg-gradient-to-r from-amber-950/80 via-purple-950/60 to-slate-900 border-amber-500/50 hover:border-amber-400 animate-pulse'
            : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/30'
        }`}
      >
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 text-xl font-black">
            🌟
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base sm:text-lg">
                1st Timer Cadet Diagnostic Guide
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  isFirstTimerDone
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {isFirstTimerDone ? 'Completed ✓ (TP Calibrated)' : 'Mandatory New User Task'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isFirstTimerDone
                ? 'Your baseline TP level is calibrated. You can revisit this 4-step diagnostic anytime.'
                : 'Clueless where to start? Complete this 4-step diagnostic (Speaking, Reading, Writing, Listening) to calibrate your TP level and unlock all learning arenas!'}
            </p>
          </div>
        </div>

        <button className="py-2.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shrink-0 shadow-md">
          <span>{isFirstTimerDone ? 'Review Diagnostic' : 'Start 1st Timer Guide'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* URGENT NOTIFICATIONS & DUE DATES BANNER (Interventions Due, Tasks Due, TP Improvements) */}
      {studentNotifications && studentNotifications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Notifikasi Murid & Tugasan Due (Student Action Center)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playPopChirp();
                  setShowNotifModal(true);
                }}
                className="px-3 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold text-xs border border-indigo-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Lihat Semua ({studentNotifications.length})</span>
                {studentNotifications.filter((n) => !n.read).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Remedial Intervention Due Card */}
            {studentNotifications.find((n) => n.category === 'intervention_due') && (
              <div
                onClick={() => {
                  const intNotif = studentNotifications.find((n) => n.category === 'intervention_due');
                  if (intNotif) {
                    playPopChirp();
                    openStudentInterventionById(intNotif.targetId || 'int-1');
                  }
                }}
                className="p-5 rounded-3xl bg-gradient-to-br from-rose-950/40 via-amber-950/20 to-slate-900 border border-amber-500/40 shadow-xl hover:border-amber-400 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>Pelan Intervensi Ditugaskan</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      Tindakan Segera
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>

                <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                  Remedial Intervention: Speaking Buddy Fluency
                </h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  Cikgu Sarah menugaskan bimbingan terbeza DSKP 2.1.1 untuk meningkatkan Tahap Penguasaan Speaking ke TP4.
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Due: 25 Sept 2026, 11:59 PM</span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-400 group-hover:underline">
                    Lakukan Intervensi Sekarang →
                  </span>
                </div>
              </div>
            )}

            {/* Task Due Soon / TP Improvement Card */}
            {studentNotifications.find((n) => n.category === 'task_due' || n.category === 'tp_improved') && (
              <div
                onClick={() => {
                  const notif = studentNotifications.find(
                    (n) => n.category === 'task_due' || n.category === 'tp_improved'
                  );
                  if (notif) {
                    playPopChirp();
                    if (notif.category === 'tp_improved') {
                      setCurrentView('parent-summary');
                    } else {
                      setCurrentView('student-listening');
                    }
                  }
                }}
                className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-emerald-950/20 to-slate-900 border border-emerald-500/40 shadow-xl hover:border-emerald-400 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-500/30 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>PBD TP Kemaskini: Listening TP4</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                      Tugasan Gamifikasi
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>

                <h4 className="font-black text-sm text-white group-hover:text-emerald-300 transition-colors">
                  Listening Bay: Drag & Drop Answer Box
                </h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  Selesaikan soalan dialog menggunakan mekanik drag-and-drop ke dalam kotak sebelum tarikh tamat.
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Due: 24 Sept 2026, 05:00 PM</span>
                  </div>
                  <span className="text-[11px] font-black text-cyan-400 group-hover:underline">
                    Buka Audio Quest →
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4 Skill Learning Arenas Navigation (Fixes routes and links) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>English Skills Lab Arenas</span>
          </h2>
          <span className="text-xs text-slate-400">Task Locked until Prerequisite Completed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Reading Island',
              desc: 'Read passages aloud with live word highlight & earn Reading Superstar stars.',
              icon: BookOpen,
              color: 'from-blue-600 to-cyan-600',
              view: 'student-reading',
              starsAward: '+3 ⭐',
              status: isFirstTimerDone ? 'Unlocked' : 'Locked with Diagnostic',
              unlocked: isFirstTimerDone,
            },
            {
              title: 'Speaking Arena',
              desc: 'Detailed voice conversation with Milo the AI buddy & pronunciation evaluation.',
              icon: Mic,
              color: 'from-red-600 to-amber-600',
              view: 'student-speaking',
              starsAward: '+3 ⭐',
              status: isFirstTimerDone ? 'Unlocked' : 'Locked with Diagnostic',
              unlocked: isFirstTimerDone,
            },
            {
              title: 'Writing Workshop',
              desc: 'Cikgu AI Teacher evaluates paragraphs with red wavy underlines and grammar rules.',
              icon: PenTool,
              color: 'from-purple-600 to-pink-600',
              view: 'student-writing',
              starsAward: '+3 ⭐',
              status: isFirstTimerDone ? 'Unlocked' : 'Locked with Diagnostic',
              unlocked: isFirstTimerDone,
            },
            {
              title: 'Listening Bay',
              desc: 'Listen to native dialogues, hone audio discernment & solve comprehension puzzles.',
              icon: Headphones,
              color: 'from-emerald-600 to-teal-600',
              view: 'student-listening',
              starsAward: '+3 ⭐',
              status: isFirstTimerDone ? 'Unlocked' : 'Locked with Diagnostic',
              unlocked: isFirstTimerDone,
            },
          ].map((zone, idx) => {
            const Icon = zone.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  if (zone.unlocked) {
                    setCurrentView(zone.view);
                  } else {
                    showToast(
                      'Arena Locked 🔒',
                      'Please complete the mandatory 1st Timer Cadet Diagnostic first!',
                      'warning'
                    );
                    setCurrentView('first-timer');
                  }
                }}
                className={`group p-5 rounded-3xl border shadow-xl transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between ${
                  zone.unlocked
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-br ${zone.color} text-white shadow-lg`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[11px] border border-amber-500/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {zone.starsAward}
                    </span>
                  </div>
                  <h3 className="font-black text-white text-base mb-1">{zone.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{zone.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
                  {zone.unlocked ? (
                    <>
                      <span className="text-cyan-400 group-hover:text-cyan-300">Enter Arena</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                      <span className="text-[10px] text-amber-400">Complete Step 1st</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GAMIFIED ARCADES & SKILL UPGRADES PROGRESSION HUB */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-2xl shadow-lg">
              🎮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">
                  Gamified Skill Arcades & Unlock Progression
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] border border-indigo-500/30">
                  Level {student.level} Cadet
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Apabila murid meningkatkan TP kemahiran & naik level, permainan baharu, task dan gaya interaksi soalan unik akan dibuka!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total XP:</span>
            <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/30 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>{student.xp} XP</span>
            </span>
          </div>
        </div>

        {/* The 5 Gamified Challenges Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Listening: Drag & Drop Answer Box */}
          <div
            onClick={() => setCurrentView('student-listening')}
            className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  <span>Listening Lab</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Unlocked ✓
                </span>
              </div>
              <h4 className="font-black text-white text-sm group-hover:text-emerald-300 transition-colors">
                Drag & Drop Answer Box
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Dengar dialog audio, tarik kad pilihan jawapan ke dalam kotak sasaran, dan tekan "Check My Answer".
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>+3 ⭐ Stars • DSKP 1.2.1 Audio Recall</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>Main Audio Quest</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Reading: Speed Anagram & Word Scramble Duel */}
          <div
            onClick={() => setCurrentView('student-reading')}
            className="p-5 rounded-2xl bg-slate-950/80 border border-blue-500/40 hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Reading Island</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Unlocked (TP3+) ✓
                </span>
              </div>
              <h4 className="font-black text-white text-sm group-hover:text-blue-300 transition-colors">
                Speed Word Scramble & Cloze Duel
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Susun huruf rawak menjadi kosa kata petikan cerita & cabar pemahaman pantas sebelum masa tamat!
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>+3 ⭐ Stars • DSKP 3.1.2 Fluency</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span>Buka Word Duel</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Writing: Castle SVO Constructor */}
          <div
            onClick={() => setCurrentView('student-writing')}
            className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/40 hover:border-purple-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase flex items-center gap-1">
                  <PenTool className="w-3 h-3" />
                  <span>Writing Lab</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Unlocked (TP3+) ✓
                </span>
              </div>
              <h4 className="font-black text-white text-sm group-hover:text-purple-300 transition-colors">
                Castle SVO Sentence Wall Builder
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Bina dinding istana tatabahasa dengan memasang blok Subjek, Kata Kerja, dan Objek tanpa kesilapan SVA.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>+3 ⭐ Stars • DSKP 4.2.1 Sentence Craft</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
              <span>Buka Castle Wall</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Speaking: 60-Second Impromptu Speech */}
          <div
            onClick={() => setCurrentView('student-speaking')}
            className="p-5 rounded-2xl bg-slate-950/80 border border-red-500/40 hover:border-red-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-[10px] font-black uppercase flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  <span>Speaking Arena</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Unlocked (TP4+) ✓
                </span>
              </div>
              <h4 className="font-black text-white text-sm group-hover:text-red-300 transition-colors">
                60s Rapid Impromptu Voice Battle
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Bercakap terus dengan Milo AI menggunakan mikrofon dengan meter kelancaran sebutan masa-nyata.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>+4 ⭐ Stars • DSKP 2.1.2 Speaking Spontaneity</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-red-400 group-hover:text-red-300">
              <span>Mula Voice Battle</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Master Tournament: Grand Master PBD Championship */}
          <div
            onClick={() => {
              if (student.level >= 7) {
                showToast('Championship Unlocked! 🏆', 'Anda memenuhi syarat TP5 & Level 7! Masuk ke mana-mana arena untuk memulakan cabaran Master.', 'success');
                setCurrentView('student-listening');
              } else {
                showToast('Tournament Terkunci 🔒', 'Capai Level 7 & TP5 ke atas untuk menyertai Grand Master PBD Championship!', 'info');
              }
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
              student.level >= 7
                ? 'bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 border-amber-500/50 hover:border-amber-400 shadow-xl shadow-amber-500/10'
                : 'bg-slate-950/30 border-slate-800 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>Master Championship</span>
                </span>
                {student.level >= 7 ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                    Grand Champion Unlocked 👑
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> TP5+ Required
                  </span>
                )}
              </div>
              <h4 className="font-black text-white text-sm group-hover:text-amber-300 transition-colors">
                Grand Master Cross-Skill Tournament
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Ujian 4-kemahiran serentak dengan soalan gamifikasi bertingkat untuk mencapai Tahap Penguasaan TP6 Kebangsaan.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>+10 ⭐ Stars • PBD TP6 National Gold Cup</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
              <span>{student.level >= 7 ? 'Sertai Kejohanan' : 'Kunci Terbuka Pada TP5'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-black text-base sm:text-lg text-white">
                Hall of Fame: Badges & Star Rewards
              </h3>
              <p className="text-xs text-slate-400">
                Milestones earned across reading, speaking, writing, and listening exercises
              </p>
            </div>
          </div>

          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveRewardTab('badges')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRewardTab === 'badges'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Badges ({studentBadgesList.length}/{badges.length})</span>
            </button>
            <button
              onClick={() => setActiveRewardTab('stars')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRewardTab === 'stars'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Star History ({studentStars} ⭐)</span>
            </button>
          </div>
        </div>

        {activeRewardTab === 'badges' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {badges.map((badge) => {
              const isUnlocked = studentBadgesList.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge, isUnlocked)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    isUnlocked
                      ? 'bg-slate-950/80 border-amber-500/40 shadow-lg shadow-amber-500/5 hover:scale-105 hover:border-amber-400'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-40 hover:opacity-60'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl mb-2">{badge.icon}</div>
                  <div className="text-xs font-black text-white line-clamp-1">{badge.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{badge.description}</div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-purple-300">+{badge.xp} XP</span>
                    <span
                      className={`font-black ${
                        isUnlocked ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {isUnlocked ? 'Unlocked ✓' : 'Locked 🔒'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeRewardTab === 'stars' && (
          <div className="space-y-3">
            {starHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No stars earned yet. Try reading a passage aloud or speaking with Milo to earn your first star!
              </div>
            ) : (
              starHistory.map((starReward: any) => (
                <div
                  key={starReward.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 fill-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{starReward.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          +{starReward.starsCount} ⭐ Stars
                        </span>
                        <span className="text-[10px] text-purple-300 font-semibold">
                          +{starReward.xpEarned} XP
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{starReward.praiseMessage}</p>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>Exercise: {starReward.exerciseName}</span>
                        <span>•</span>
                        <span>Awarded: {starReward.awardedAt}</span>
                      </div>
                    </div>
                  </div>

                  {starReward.badgeName && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 shrink-0">
                      <span>{starReward.badgeIcon || '🏆'}</span>
                      <span className="font-bold text-amber-300">{starReward.badgeName}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Badge Modal */}
      {selectedBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative">
            <div className="text-5xl mb-3">{selectedBadgeModal.icon}</div>
            <h3 className="text-xl font-black text-white">{selectedBadgeModal.name}</h3>
            <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 mt-1 mb-3">
              {selectedBadgeModal.category} Mastery Badge
            </span>
            <p className="text-xs text-slate-300 mb-4">{selectedBadgeModal.description}</p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-purple-300 font-bold mb-4">
              Reward: +{selectedBadgeModal.xp} XP added to profile
            </div>
            <button
              onClick={() => setSelectedBadgeModal(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all cursor-pointer"
            >
              AWESOME! KEEP LEARNING
            </button>
          </div>
        </div>
      )}

      {/* Personalise Theme Modal */}
      {showProfileModal && (
        <PersonaliseProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Google Drive Cloud Sync Modal */}
      <GoogleDriveSyncModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
      />

      {/* Student Notifications Hub Modal */}
      {showNotifModal && (
        <StudentNotificationModal
          isOpen={showNotifModal}
          onClose={() => setShowNotifModal(false)}
        />
      )}
    </div>
  );
};
