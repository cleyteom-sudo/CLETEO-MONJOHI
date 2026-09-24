import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Sparkles,
  BookOpen,
  Volume2,
  PenTool,
  Headphones,
  Check,
  Trash2,
  Clock,
  UserCheck,
  FolderPlus,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TeacherNotification } from '../../types';

export const TeacherNotificationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenClassManager?: () => void;
}> = ({ isOpen, onClose, onOpenClassManager }) => {
  const {
    teacherNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearTeacherNotifications,
    acceptStudentEnrollment,
    reassignStudentClass,
    createMissingClassAndEnroll,
    classes,
    setCurrentView,
    showToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'enrollments' | 'tasks' | 'missing_class'>('all');
  const [reassignModalStudent, setReassignModalStudent] = useState<{ id: string; name: string; currentClass: string } | null>(null);
  const [selectedReassignClass, setSelectedReassignClass] = useState<string>('');

  if (!isOpen) return null;

  const filteredNotifications = teacherNotifications.filter((n) => {
    if (activeFilter === 'enrollments') return n.category === 'new_enrollment';
    if (activeFilter === 'tasks') return n.category === 'task_completed';
    if (activeFilter === 'missing_class') return n.category === 'missing_class';
    return true;
  });

  const unreadCount = teacherNotifications.filter((n) => !n.read).length;
  const missingClassCount = teacherNotifications.filter((n) => n.category === 'missing_class').length;
  const enrollmentCount = teacherNotifications.filter((n) => n.category === 'new_enrollment').length;
  const taskCount = teacherNotifications.filter((n) => n.category === 'task_completed').length;

  const getCategoryIcon = (category: string, skill?: string) => {
    if (category === 'missing_class') {
      return (
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
        </div>
      );
    }
    if (category === 'new_enrollment') {
      return (
        <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          <UserCheck className="w-5 h-5 text-cyan-400" />
        </div>
      );
    }
    // Task completed: specific skill icon
    if (skill === 'Reading') {
      return (
        <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <BookOpen className="w-5 h-5 text-blue-400" />
        </div>
      );
    }
    if (skill === 'Speaking') {
      return (
        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Volume2 className="w-5 h-5 text-emerald-400" />
        </div>
      );
    }
    if (skill === 'Writing') {
      return (
        <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <PenTool className="w-5 h-5 text-purple-400" />
        </div>
      );
    }
    if (skill === 'Listening') {
      return (
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Headphones className="w-5 h-5 text-amber-400" />
        </div>
      );
    }
    return (
      <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
        <Sparkles className="w-5 h-5 text-indigo-400" />
      </div>
    );
  };

  const handleAcceptEnrollment = (notif: TeacherNotification) => {
    if (!notif.studentId) return;
    acceptStudentEnrollment(notif.studentId);
    markNotificationAsRead(notif.id);
  };

  const handleCreateMissingClass = (notif: TeacherNotification) => {
    if (!notif.className) return;
    const year = notif.year || 4;
    createMissingClassAndEnroll(notif.studentId || '', notif.className, year);
    markNotificationAsRead(notif.id);
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[calc(100vh-2rem)] sm:max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/70 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black border-2 border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Teacher Notification Center</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time alerts for student enrollments, task completions, and class setup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Actions Bar */}
        <div className="px-4 sm:px-5 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({teacherNotifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('enrollments')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'enrollments'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Enrollments</span>
              {enrollmentCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-400 text-slate-950 font-black">
                  {enrollmentCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('tasks')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'tasks'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Tasks & Stars</span>
              {taskCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-400 text-slate-950 font-black">
                  {taskCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('missing_class')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'missing_class'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Missing Classes</span>
              {missingClassCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
                  {missingClassCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
            {teacherNotifications.length > 0 && (
              <button
                onClick={clearTeacherNotifications}
                className="text-[11px] font-semibold text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-400">No notifications in this category</p>
              <p className="text-[11px] text-slate-500 mt-1">
                You will be notified when students enroll, finish reading or speaking tasks, or request missing classes.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  !notif.read
                    ? notif.category === 'missing_class'
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/20'
                      : notif.category === 'new_enrollment'
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
                      : 'bg-slate-800/60 border-blue-500/40 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getCategoryIcon(notif.category, notif.skill)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-white">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                      )}
                      {notif.category === 'missing_class' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                          Action Required
                        </span>
                      )}
                      {notif.category === 'new_enrollment' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                          New Student
                        </span>
                      )}
                      {notif.category === 'task_completed' && notif.score !== undefined && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {notif.score}% Score • +{notif.starsEarned || 2} ⭐
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {notif.timestamp}
                      </span>
                      {notif.targetTeacher && (
                        <span className="text-indigo-400">Assigned Teacher: {notif.targetTeacher}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {notif.category === 'missing_class' && (
                    <button
                      onClick={() => handleCreateMissingClass(notif)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Class Now</span>
                    </button>
                  )}

                  {notif.category === 'new_enrollment' && (
                    <>
                      <button
                        onClick={() => handleAcceptEnrollment(notif)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept & Enroll</span>
                      </button>
                      <button
                        onClick={() => {
                          setReassignModalStudent({
                            id: notif.studentId || '',
                            name: notif.studentName || 'Student',
                            currentClass: notif.className || '',
                          });
                          setSelectedReassignClass(classes[0]?.name || '');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                        title="Reassign to another class"
                      >
                        Change Class
                      </button>
                    </>
                  )}

                  {notif.category === 'task_completed' && (
                    <button
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        onClose();
                        setCurrentView('quick-assess');
                        showToast('Opened Assessment', `Reviewing assessment for ${notif.studentName || 'student'}.`, 'info');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Review TP</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reassign Student Quick Modal */}
        {reassignModalStudent && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white">Reassign {reassignModalStudent.name}</h4>
                <button
                  onClick={() => setReassignModalStudent(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Move student from <strong>{reassignModalStudent.currentClass}</strong> to another existing class:
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Target Class:</label>
                <select
                  value={selectedReassignClass}
                  onChange={(e) => setSelectedReassignClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Year {c.year})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setReassignModalStudent(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const targetCls = classes.find((c) => c.name === selectedReassignClass);
                    reassignStudentClass(reassignModalStudent.id, selectedReassignClass, targetCls?.year);
                    setReassignModalStudent(null);
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow"
                >
                  Confirm Reassign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            {unreadCount > 0 ? (
              <span className="text-blue-400 font-semibold">{unreadCount} pending teacher action(s)</span>
            ) : (
              <span>All notifications caught up</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onOpenClassManager && (
              <button
                onClick={() => {
                  onClose();
                  onOpenClassManager();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Go to Class Approvals</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
