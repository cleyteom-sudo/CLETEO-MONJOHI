import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Bell,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Headphones,
  BookOpen,
  Mic,
  PenTool,
  CheckCheck,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentNotification, StudentNotificationCategory } from '../../types';
import { playPopChirp, playStarChime } from '../../utils/soundEffects';

interface StudentNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenIntervention?: (interventionId?: string) => void;
}

export const StudentNotificationModal: React.FC<StudentNotificationModalProps> = ({
  isOpen,
  onClose,
  onOpenIntervention,
}) => {
  const {
    studentNotifications,
    markStudentNotificationAsRead,
    markAllStudentNotificationsAsRead,
    setCurrentView,
    openStudentInterventionById,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'due' | 'tp' | 'badges' | 'completed'>('all');

  if (!isOpen) return null;

  const unreadCount = studentNotifications.filter((n) => !n.read).length;

  const filteredNotifications = studentNotifications.filter((n) => {
    if (activeFilter === 'due') {
      return n.category === 'intervention_due' || n.category === 'task_due';
    }
    if (activeFilter === 'tp') {
      return n.category === 'tp_improved';
    }
    if (activeFilter === 'badges') {
      return n.category === 'badge_unlocked' || n.category === 'achievement';
    }
    if (activeFilter === 'completed') {
      return n.category === 'task_completed';
    }
    return true;
  });

  const dueCount = studentNotifications.filter(
    (n) => n.category === 'intervention_due' || n.category === 'task_due'
  ).length;
  const tpCount = studentNotifications.filter((n) => n.category === 'tp_improved').length;
  const badgeCount = studentNotifications.filter(
    (n) => n.category === 'badge_unlocked' || n.category === 'achievement'
  ).length;

  const handleNotificationClick = (notif: StudentNotification) => {
    markStudentNotificationAsRead(notif.id);
    playPopChirp();

    if (notif.actionType === 'open_intervention') {
      if (onOpenIntervention) {
        onOpenIntervention(notif.targetId);
      } else {
        openStudentInterventionById(notif.targetId || 'int-1');
      }
      onClose();
      return;
    }

    if (notif.actionType === 'open_task') {
      if (notif.targetView) {
        setCurrentView(notif.targetView);
      } else if (notif.targetSkill) {
        const skillViewMap: Record<string, string> = {
          Listening: 'student-listening',
          Reading: 'student-reading',
          Speaking: 'student-speaking',
          Writing: 'student-writing',
        };
        setCurrentView(skillViewMap[notif.targetSkill] || 'student-world');
      } else {
        setCurrentView('task-history');
      }
      onClose();
      return;
    }

    if (notif.actionType === 'open_badge') {
      setCurrentView('student-portfolio');
      onClose();
      return;
    }

    if (notif.actionType === 'open_tp') {
      setCurrentView('parent-summary');
      onClose();
      return;
    }

    if (notif.targetView) {
      setCurrentView(notif.targetView);
      onClose();
    }
  };

  const getCategoryBadge = (category: StudentNotificationCategory) => {
    switch (category) {
      case 'intervention_due':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Intervensi Due</span>
          </span>
        );
      case 'task_due':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Tugasan Due</span>
          </span>
        );
      case 'tp_improved':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Peningkatan TP</span>
          </span>
        );
      case 'badge_unlocked':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold uppercase flex items-center gap-1">
            <Award className="w-3 h-3 text-purple-400" />
            <span>Lencana Dibuka</span>
          </span>
        );
      case 'achievement':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Pencapaian XP</span>
          </span>
        );
      case 'task_completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-400" />
            <span>Tugasan Selesai</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getActionLabel = (notif: StudentNotification) => {
    switch (notif.actionType) {
      case 'open_intervention':
        return 'Lakukan Intervensi Sekarang →';
      case 'open_task':
        return 'Buka Tugasan Ini →';
      case 'open_badge':
        return 'Lihat Portfolio & Lencana →';
      case 'open_tp':
        return 'Lihat Kemajuan PBD →';
      default:
        return 'Lihat Terperinci →';
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[88vh] overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Notifikasi Murid</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                    {unreadCount} Belum Dibaca
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Peringatan intervensi due, tugasan, peningkatan TP & ganjaran lencana.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllStudentNotificationsAsRead}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Tanda Semua Dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Tanda Semua Dibaca</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white font-extrabold shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            Semua ({studentNotifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('due')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'due'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-amber-400/90 hover:text-amber-300 bg-amber-950/30 border border-amber-500/20'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Tugasan & Intervensi Due ({dueCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('tp')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'tp'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-emerald-400/90 hover:text-emerald-300 bg-emerald-950/30 border border-emerald-500/20'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Peningkatan TP ({tpCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('badges')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'badges'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'text-purple-400/90 hover:text-purple-300 bg-purple-950/30 border border-purple-500/20'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>Lencana ({badgeCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-teal-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            Selesai
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 min-h-0">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-950/50 border border-slate-800">
              Tiada notifikasi untuk kategori ini.
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUrgent = notif.priority === 'urgent' || notif.category === 'intervention_due';
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] relative overflow-hidden group ${
                    !notif.read
                      ? isUrgent
                        ? 'bg-gradient-to-r from-rose-950/30 via-amber-950/20 to-slate-900 border-amber-500/40 shadow-lg'
                        : 'bg-slate-850/80 border-indigo-500/40 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Unread indicator ribbon */}
                  {!notif.read && (
                    <div
                      className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                        isUrgent ? 'bg-amber-400 animate-pulse' : 'bg-indigo-500'
                      }`}
                    />
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 pl-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(notif.category)}
                        <span className="text-[11px] text-slate-500">{notif.timestamp}</span>
                        {notif.tpChange && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                            {notif.tpChange.from} ➔ {notif.tpChange.to}
                          </span>
                        )}
                        {notif.badgeIcon && (
                          <span className="text-base">{notif.badgeIcon}</span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                        {notif.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Prominent Date and Time Due Indicator */}
                      {notif.dueDateTime && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mt-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Tarikh & Masa Tamat (Due):</span>
                          <span className="text-white font-extrabold">{notif.dueDateTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Direct Action Button */}
                    <div className="sm:self-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notif);
                        }}
                        className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                          isUrgent
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        <span>{getActionLabel(notif)}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between shrink-0">
          <span>Ketik sebarang notifikasi untuk terus ke modul & tugasan berkaitan.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
