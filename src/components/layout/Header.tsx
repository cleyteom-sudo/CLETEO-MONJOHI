import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
  QrCode,
  Settings,
  LogOut,
  ChevronDown,
  Flame,
  Zap,
  GraduationCap,
  PlayCircle,
  Menu,
  Palette,
  User,
  Check,
  Wand2,
  Cloud,
  Bell,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PersonaliseProfileModal } from '../common/PersonaliseProfileModal';
import { CloudSyncModal } from '../common/CloudSyncModal';
import { TeacherNotificationModal } from '../teacher/TeacherNotificationModal';
import { StudentNotificationModal } from '../student/StudentNotificationModal';
import { StudentInterventionModal } from '../student/StudentInterventionModal';
import { THEME_CONFIGS } from './ThemeBackground';
import { ThemeType } from '../../types';

export const Header: React.FC<{
  onToggleMobileMenu?: () => void;
  onOpenAuth?: () => void;
}> = ({ onToggleMobileMenu, onOpenAuth }) => {
  const {
    role,
    isAdmin,
    user,
    switchRole,
    logout,
    currentView,
    setCurrentView,
    selectedStudent,
    setQrModalStudent,
    teacherProfile,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    timeFormat,
    setTimeFormat,
    showToast,
    teacherNotifications,
    studentNotifications,
    activeStudentIntervention,
    setActiveStudentIntervention,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isPersonaliseOpen, setIsPersonaliseOpen] = useState(false);
  const [personaliseTab, setPersonaliseTab] = useState<'profile' | 'theme'>('profile');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isTeacherNotificationOpen, setIsTeacherNotificationOpen] = useState(false);
  const [isStudentNotificationOpen, setIsStudentNotificationOpen] = useState(false);

  const unreadNotificationCount = teacherNotifications ? teacherNotifications.filter((n) => !n.read).length : 0;
  const unreadStudentNotifCount = studentNotifications ? studentNotifications.filter((n) => !n.read).length : 0;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Malaysian format: 30 August 2026, 10:35 AM or 10:35:20
      const dateString = now.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const timeString = now.toLocaleTimeString(timeFormat === '12h' ? 'en-US' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: timeFormat === '12h',
      });
      setCurrentDate(dateString);
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeFormat]);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left branding & mobile menu toggle */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 focus:outline-none"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => setCurrentView(role === 'teacher' ? 'teacher-dashboard' : 'student-world')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ENGLISH AI SMARTTRACK
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                  PBD v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Assess. Analyse. Act. • Record Less. Assess Smarter.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Real-Time Clock */}
        <button
          type="button"
          onClick={() => {
            const next = timeFormat === '12h' ? '24h' : '12h';
            setTimeFormat(next);
            showToast(
              'Format Masa Dikemaskini',
              next === '24h'
                ? 'Sistem 24 Jam diaktifkan (00:00–23:59)'
                : 'Sistem 12 Jam diaktifkan (AM / PM)',
              'info'
            );
          }}
          title="Klik untuk tukar format sistem masa (12 Jam AM/PM / 24 Jam)"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 shadow-inner transition-all cursor-pointer group"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse group-hover:rotate-12 transition-transform" />
          <span className="font-medium text-slate-200">{currentDate}</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-cyan-300 font-semibold">{currentTime}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 uppercase">
            {timeFormat}
          </span>
          <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-800">
            MYT
          </span>
        </button>

        {/* Right side controls: Role switcher, Live demo button, QR, User avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Demo Tour Button */}
          <button
            onClick={() => setCurrentView('live-demo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
              currentView === 'live-demo'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-orange-500/25'
                : 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <PlayCircle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline font-bold">LIVE DEMO</span>
            <span className="sm:hidden font-bold">DEMO</span>
          </button>

          {/* Student QR Portfolio Shortcut */}
          <button
            onClick={() => setQrModalStudent(selectedStudent)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-colors"
            title="Scan Student QR Portfolio"
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            <span className="hidden lg:inline text-[11px] font-medium">QR Portfolio</span>
          </button>

          {/* Accessible Font Size Switcher (User-Friendly for Senior Teachers & Young Pupils) */}
          <div className="hidden md:flex items-center rounded-lg bg-slate-900 border border-slate-700/80 p-0.5 text-xs text-slate-300">
            <button
              onClick={() => {
                setFontSize('normal');
                showToast('Saiz Tulisan: Biasa', 'Format teks saiz standard diaktifkan.', 'info');
              }}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                fontSize === 'normal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Saiz Teks Biasa (Standard)"
            >
              A
            </button>
            <button
              onClick={() => {
                setFontSize('large');
                showToast('Saiz Tulisan: Besar', 'Format teks besar diaktifkan untuk kemudahan membaca.', 'info');
              }}
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                fontSize === 'large'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Saiz Teks Besar (Mudah Dibaca)"
            >
              A+
            </button>
            <button
              onClick={() => {
                setFontSize('extra-large');
                showToast('Saiz Tulisan: Sangat Besar', 'Format teks ekstra besar diaktifkan.', 'info');
              }}
              className={`px-2 py-1 rounded text-sm font-extrabold transition-all cursor-pointer ${
                fontSize === 'extra-large'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Saiz Teks Sangat Besar (Mesra Pengguna Senior & Murid Tahap 1)"
            >
              A++
            </button>
          </div>

          {/* Cloud Synchronization Button */}
          <button
            onClick={() => setIsCloudSyncOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/40 hover:border-cyan-400 text-xs font-bold text-cyan-300 transition-all cursor-pointer shadow-sm hover:shadow-cyan-500/20"
            title="Google Cloud Real-time Sync: Data updates automatically across all laptops and phones"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline">Cloud Sync</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          {/* Teacher Notification Bell (Role: Teacher or Admin) */}
          {(role === 'teacher' || isAdmin) && (
            <button
              onClick={() => setIsTeacherNotificationOpen(true)}
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer"
              title={`Pemberitahuan Guru & Enrolmen (${unreadNotificationCount} belum dibaca)`}
            >
              <Bell className="w-4 h-4 text-cyan-400" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-md animate-pulse">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Student Notification Bell (Role: Student) */}
          {role === 'student' && (
            <button
              onClick={() => setIsStudentNotificationOpen(true)}
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/40 hover:border-indigo-400 transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/20"
              title={`Notifikasi Murid: Intervensi & Tugasan Due (${unreadStudentNotifCount} belum dibaca)`}
            >
              <Bell className="w-4 h-4 text-indigo-400" />
              {unreadStudentNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-md animate-bounce">
                  {unreadStudentNotifCount > 99 ? '99+' : unreadStudentNotifCount}
                </span>
              )}
            </button>
          )}

          {/* Role Display: Only Admins can switch active role */}
          {!isAdmin ? (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                role === 'teacher'
                  ? 'bg-blue-950/70 border-blue-800/80 text-blue-300'
                  : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300'
              }`}
              title={role === 'teacher' ? 'Akaun Guru Sah DELIMa' : 'Akaun Murid Sah DELIMa'}
            >
              {role === 'teacher' ? (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Guru (Teacher)</span>
                  <span className="sm:hidden">Guru</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Murid (Student)</span>
                  <span className="sm:hidden">Murid</span>
                </>
              )}
            </div>
          ) : (
            /* Quick Role Switcher Pill (Admin Only) */
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/60 hover:border-amber-400 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                title="Admin: Tukar Peranan Aktif"
              >
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/25 text-amber-300 border border-amber-500/40">
                  ADMIN
                </span>
                {role === 'teacher' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-semibold text-blue-300">Teacher</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-emerald-300">Student</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 mb-1 flex items-center justify-between">
                    <span>Akses Pentadbir (Admin)</span>
                    <span className="text-[9px] text-slate-400">Switch Role</span>
                  </div>
                  <button
                    onClick={() => {
                      switchRole('teacher');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                      role === 'teacher' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      <span className="truncate">{teacherProfile.name} (Guru)</span>
                    </div>
                    {role === 'teacher' && <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('student');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                      role === 'student' ? 'bg-emerald-600/20 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span className="truncate">{selectedStudent?.name || 'Daniel Lee'} (Murid)</span>
                    </div>
                    {role === 'student' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Student XP and Streak Pills if in student mode */}
          {role === 'student' && selectedStudent && (
            <div className="hidden xl:flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-300">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>{selectedStudent.streakDays}d Streak</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300">
                <span>⭐ {selectedStudent.xp} XP</span>
              </div>
            </div>
          )}

          {/* Personalise Theme Button with Quick Switcher */}
          <div className="relative">
            <div className="flex items-center rounded-lg bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-xs font-bold shadow-sm">
              <button
                onClick={() => {
                  setPersonaliseTab('theme');
                  setIsPersonaliseOpen(true);
                  setThemeDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-cyan-300 hover:text-white transition-colors"
                title="Personalise Background Themes & AI Pictures"
              >
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-extrabold flex items-center gap-1 text-white">
                  <span>{THEME_CONFIGS[theme]?.icon || '🚀'}</span>
                  <span className="hidden md:inline">
                    {THEME_CONFIGS[theme]?.name ? THEME_CONFIGS[theme].name.replace(' Theme', '') : 'Stars'}
                  </span>
                  <span className="inline md:hidden text-[10px]">Theme</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setThemeDropdownOpen((prev) => !prev)}
                className="px-1.5 py-1.5 border-l border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                title="Quick Switch Themes"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Theme Dropdown Menu */}
            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 p-2 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                  <span>Switch Background Theme</span>
                  <span className="text-cyan-400 font-bold">Instant</span>
                </div>

                <div className="space-y-1">
                  {(
                    [
                      'spaceship_stars',
                      'forest',
                      'disney_cartoon',
                      'undersea',
                      'volcano_future',
                    ] as ThemeType[]
                  ).map((themeKey) => {
                    const cfg = THEME_CONFIGS[themeKey];
                    const isSelected = theme === themeKey;
                    if (!cfg) return null;

                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => {
                          setTheme(themeKey);
                          setThemeDropdownOpen(false);
                          showToast('Theme Changed', `Applied ${cfg.name}!`, 'success');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-bold'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cfg.icon}</span>
                          <span className="text-[11px]">{cfg.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setThemeDropdownOpen(false);
                      setPersonaliseTab('theme');
                      setIsPersonaliseOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-extrabold shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>AI Pictures & Wallpapers...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Personalise Profile Button */}
          <button
            onClick={() => {
              setPersonaliseTab('profile');
              setIsPersonaliseOpen(true);
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
            title="Personalise Profile & Photo"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-800/40 transition-colors"
            title="Log Out (DELIMa / MOE Session)"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* User Avatar */}
          <div
            onClick={() => {
              setPersonaliseTab('profile');
              setIsPersonaliseOpen(true);
            }}
            className="cursor-pointer flex items-center gap-2 pl-1"
            title="Click to Personalise Profile Photo & Name"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full ring-2 ring-cyan-500/60 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Personalise Profile and Themes Modal */}
      <PersonaliseProfileModal
        isOpen={isPersonaliseOpen}
        onClose={() => setIsPersonaliseOpen(false)}
        defaultTab={personaliseTab}
      />

      {/* Cross-Device Cloud Synchronization Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
      />

      {/* Teacher Notifications & Class Enrollment Approvals Modal */}
      <TeacherNotificationModal
        isOpen={isTeacherNotificationOpen}
        onClose={() => setIsTeacherNotificationOpen(false)}
        onOpenClassManager={() => setCurrentView('class-management')}
      />

      {/* Student Notifications Modal */}
      <StudentNotificationModal
        isOpen={isStudentNotificationOpen}
        onClose={() => setIsStudentNotificationOpen(false)}
        onOpenIntervention={(intId) => {
          setIsStudentNotificationOpen(false);
        }}
      />

      {/* Direct Student Intervention Modal */}
      {activeStudentIntervention && (
        <StudentInterventionModal
          intervention={activeStudentIntervention}
          isOpen={!!activeStudentIntervention}
          onClose={() => setActiveStudentIntervention(null)}
        />
      )}
    </header>
  );
};
