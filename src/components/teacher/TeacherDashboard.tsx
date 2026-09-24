import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  PenTool,
  Headphones,
  Mic,
  AlertTriangle,
  TrendingUp,
  Clock,
  ClipboardCheck,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileCheck,
  FileText,
  User,
  Palette,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Award,
  Printer,
  Activity,
  AlertCircle,
  Plus,
  Bell,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExportPBDPdfModal } from './ExportPBDPdfModal';
import { PersonaliseProfileModal } from '../common/PersonaliseProfileModal';
import { AdminSpreadsheetModal } from '../auth/AdminSpreadsheetModal';
import { TeacherNotificationModal } from './TeacherNotificationModal';
import { hasAdminSpreadsheetAccess } from '../../utils/invitedAccess';
import { FileSpreadsheet } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    students,
    classes,
    selectedClassId,
    setSelectedClassId,
    setCurrentView,
    evidenceList,
    interventions,
    teacherProfile,
    guruBesarName,
    timeFormat,
    setTimeFormat,
    showToast,
    classEnrollmentAlerts,
    resolveEnrollmentAlert,
    teacherNotifications,
  } = useApp();

  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isPersonaliseOpen, setIsPersonaliseOpen] = useState(false);
  const [isAdminSpreadsheetOpen, setIsAdminSpreadsheetOpen] = useState(false);
  const [isTeacherNotificationOpen, setIsTeacherNotificationOpen] = useState(false);
  const [currentDateObj, setCurrentDateObj] = useState<Date>(() => new Date());

  const unreadNotificationCount = teacherNotifications ? teacherNotifications.filter((n) => !n.read).length : 0;

  const canAccessAdminSpreadsheet = hasAdminSpreadsheetAccess(teacherProfile?.email);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateObj(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0] || {
    id: 'default',
    name: 'Default Class',
    year: 4,
    academicYear: '2026/2027',
    studentCount: 0,
    averageTP: { reading: 3, writing: 3, listening: 3, speaking: 3, overall: 3 },
  };
  const classStudents = students.filter((s) => s.className === currentClass.name);

  // Stats calculation
  const totalPupils = classStudents.length || currentClass.studentCount;
  const avgReading = currentClass.averageTP.reading;
  const avgWriting = currentClass.averageTP.writing;
  const avgListening = currentClass.averageTP.listening;
  const avgSpeaking = currentClass.averageTP.speaking;

  // Alerts
  const needIntervention = classStudents.filter(
    (s) => s.interventionStatus === 'Needs Intervention' || s.speakingTP === 'TP2' || s.writingTP === 'TP2'
  );
  const improvingPupils = classStudents.filter(
    (s) => s.interventionStatus === 'Improving' || s.overallTP === 'TP4' || s.overallTP === 'TP5'
  );
  const pendingEvidence = evidenceList.filter((e) => e.teacherStatus === 'Pending Review');
  const pendingValidationCount = classStudents.filter(
    (s) => !s.readingValidated || !s.writingValidated || !s.listeningValidated || !s.speakingValidated
  ).length;

  // Dynamic Greeting based on time in either 12-hour or 24-hour system
  const hours = currentDateObj.getHours(); // 0 to 23
  const formattedTimeStr = currentDateObj.toLocaleTimeString(
    timeFormat === '12h' ? 'en-US' : 'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: timeFormat === '12h',
    }
  );

  // Time-based greeting:
  // - 05:00 to 11:59 -> Good Morning (12h: 5:00 AM – 11:59 AM)
  // - 12:00 to 16:59 -> Good Afternoon (12h: 12:00 PM – 4:59 PM)
  // - 17:00 to 23:59 -> Good Evening (12h: 5:00 PM – 11:59 PM)
  // - 00:00 to 04:59 -> Good Evening / Late Hours (12h: 12:00 AM – 4:59 AM)
  let greetingText = 'Good Morning';
  let greetingIcon = '🌅';
  let greetingPeriodDesc = timeFormat === '12h' ? 'Morning (AM)' : '05:00 – 11:59 (Pagi)';
  let GreetingIcon = Sunrise;

  if (hours >= 12 && hours < 17) {
    greetingText = 'Good Afternoon';
    greetingIcon = '☀️';
    greetingPeriodDesc = timeFormat === '12h' ? 'Afternoon (PM)' : '12:00 – 16:59 (Tengah Hari / Petang)';
    GreetingIcon = Sun;
  } else if (hours >= 17) {
    greetingText = 'Good Evening';
    greetingIcon = '🌆';
    greetingPeriodDesc = timeFormat === '12h' ? 'Evening (PM)' : '17:00 – 23:59 (Petang / Malam)';
    GreetingIcon = Sunset;
  } else if (hours < 5) {
    greetingText = 'Good Evening';
    greetingIcon = '🌙';
    greetingPeriodDesc = timeFormat === '12h' ? 'Late Hours (AM)' : '00:00 – 04:59 (Malam / Dinihari)';
    GreetingIcon = Moon;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/60 border border-blue-800/40 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Teacher Portal • SK Seri Bintang Bestari
            </span>
            <span className="text-xs text-slate-400">Academic Year 2026/2027</span>

            {/* Live Clock & Greeting Time System Indicator */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-700/80 text-[11px] shadow-inner"
              title={`Greeting '${greetingText}' dikira berasaskan waktu sebenar (${timeFormat === '12h' ? 'Sistem 12 Jam AM/PM' : 'Sistem 24 Jam'})`}
            >
              <GreetingIcon className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-mono font-bold text-cyan-300">{formattedTimeStr}</span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] text-slate-300 font-semibold">{greetingPeriodDesc}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{greetingText}, {teacherProfile.name}!</span>
              <span className="text-2xl select-none" role="img" aria-label="greeting icon">
                {greetingIcon}
              </span>
            </h1>

            {/* Interactive 12-Hour / 24-Hour System Switcher */}
            <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow-sm" title="Tukar antara format Sistem Masa 12 Jam (AM/PM) atau 24 Jam">
              <button
                type="button"
                onClick={() => {
                  setTimeFormat('12h');
                  showToast('Sistem Masa 12 Jam', 'Waktu dan ucapan dipaparkan mengikut sistem 12 jam (AM / PM).', 'info');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  timeFormat === '12h'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                12 Jam (AM/PM)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeFormat('24h');
                  showToast('Sistem Masa 24 Jam', 'Waktu dan ucapan dipaparkan mengikut sistem 24 jam (00:00 – 23:59).', 'info');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  timeFormat === '24h'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                24 Jam (24H)
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300">
            Here is your real-time English PBD overview for{' '}
            <span className="text-cyan-300 font-bold">{currentClass.name}</span>.
          </p>
        </div>

        {/* Class selector & Teacher Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 shadow-inner"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.studentCount} Pupils)
              </option>
            ))}
          </select>

          {/* Manage Classes button */}
          <button
            onClick={() => setCurrentView('class-management')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Manage, Edit, Rename or Remove Classes"
          >
            <PenTool className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Classes</span>
          </button>

          {/* Print Parent Slip Button */}
          <button
            onClick={() => setCurrentView('parent-summary')}
            className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Cetak Slip Rekod PBD Ibu Bapa (Print Summary)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Slip Ibu Bapa</span>
          </button>

          {/* Student Activity Log Button */}
          <button
            onClick={() => setCurrentView('student-activity-log')}
            className="px-3 py-2 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-xl text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Lihat Log Aktiviti Murid"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Log Aktiviti</span>
          </button>

          {/* Export PBD as PDF Button */}
          <button
            onClick={() => setIsExportPdfOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Export Official PBD Record as PDF"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* Personalise Profile button */}
          <button
            onClick={() => setIsPersonaliseOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Personalise teacher name and profile picture"
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Profile</span>
          </button>

          {/* Edit Guru Besar Name Button */}
          <button
            onClick={() => setIsPersonaliseOpen(true)}
            className="px-3 py-2 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Tukar / Kemaskini Nama Guru Besar untuk Dokumen Rasmi, Penjana PDF & Rumusan"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline text-slate-300 font-normal">Guru Besar:</span>
            <span className="truncate max-w-[130px] font-bold text-amber-200">{guruBesarName}</span>
          </button>

          {/* Admin Google Drive Spreadsheet Log Button - Strictly for Admin and Invited Email */}
          {canAccessAdminSpreadsheet && (
            <button
              onClick={() => setIsAdminSpreadsheetOpen(true)}
              className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-xl text-xs font-bold text-emerald-300 hover:text-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Pangkalan Data Admin (Spreadsheet) — Khas untuk Admin & E-mel Jemputan Sahaja"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Pangkalan Data Admin</span>
            </button>
          )}

          {/* Teacher Notifications Button */}
          <button
            onClick={() => setIsTeacherNotificationOpen(true)}
            className="relative px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Pemberitahuan Guru & Enrolmen Murid"
          >
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Notifikasi</span>
            {unreadNotificationCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Teacher Action Notification Banner */}
      {unreadNotificationCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 border border-cyan-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Bell className="w-5 h-5 text-cyan-400 animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Pemberitahuan Guru: Aktiviti & Enrolmen Murid</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                  {unreadNotificationCount} Baharu
                </span>
              </div>
              <div className="text-xs text-slate-300">
                Pendaftaran murid baharu, pengesahan kelas, atau tugasan bahasa yang selesai memerlukan semakan guru.
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsTeacherNotificationOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <span>Buka Peti Notifikasi ({unreadNotificationCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Missing Class Enrollment Alert Banner */}
      {classEnrollmentAlerts && classEnrollmentAlerts.filter((a) => a.status === 'pending').length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <span>
                    Pemberitahuan Enrolmen DELIMa: Kelas Belum Wujud (
                    {classEnrollmentAlerts.filter((a) => a.status === 'pending').length})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Tindakan Diperlukan
                  </span>
                </h4>
                <p className="text-xs text-slate-300">
                  Murid berikut mendaftar melalui portal DELIMa dengan kelas yang belum wujud. Klik "Cipta Kelas & Sahkan Enrolmen" untuk mendaftar kelas baharu secara automatik.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {classEnrollmentAlerts
              .filter((a) => a.status === 'pending')
              .map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between gap-3 shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white text-sm">{alert.studentName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                    </div>
                    <div className="text-xs text-amber-300 font-semibold mt-1">
                      Kelas Dimohon:{' '}
                      <span className="font-bold underline text-white">{alert.requestedClass}</span>{' '}
                      (Tahun {alert.requestedYear})
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                      {alert.studentEmail}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => resolveEnrollmentAlert(alert.id, 'create_class')}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cipta Kelas & Sahkan</span>
                    </button>
                    <button
                      onClick={() => resolveEnrollmentAlert(alert.id, 'dismiss')}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-all cursor-pointer"
                      title="Abaikan pemberitahuan"
                    >
                      Abaikan
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4 Skill TP Average Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Pupils */}
        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL PUPILS</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white">{totalPupils}</div>
            <div className="text-[11px] text-slate-400 mt-1">Year {currentClass.year} Primary</div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-cyan-400 font-semibold">
            100% Enrollment Verified
          </div>
        </div>

        {/* Reading */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">READING</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">TP {avgReading.toFixed(1)}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">✓ Progressing Well</div>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(avgReading / 6) * 100}%` }} />
          </div>
        </div>

        {/* Writing */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">WRITING</span>
            <PenTool className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">TP {avgWriting.toFixed(1)}</div>
            <div className="text-[11px] text-amber-400 font-semibold mt-1">Developing</div>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(avgWriting / 6) * 100}%` }} />
          </div>
        </div>

        {/* Listening */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">LISTENING</span>
            <Headphones className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">TP {avgListening.toFixed(1)}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">Strong Mastery</div>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(avgListening / 6) * 100}%` }} />
          </div>
        </div>

        {/* Speaking (Weakest Skill highlighted) */}
        <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/50 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-300 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">SPEAKING</span>
            <Mic className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">TP {avgSpeaking.toFixed(1)}</div>
            <div className="text-[11px] text-red-400 font-bold mt-1">⚠️ Intervention Focus</div>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: `${(avgSpeaking / 6) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Early Warning: LEARNING ALERTS (Prompt Requirement #33) */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
              EARLY WARNING & LEARNING ALERTS
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click any alert to inspect pupils</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Red Alert: Speaking */}
          <div
            onClick={() => setCurrentView('intervention')}
            className="p-4 rounded-xl bg-red-950/30 border border-red-800/60 hover:border-red-600 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-red-300">🔴 5 pupils need Speaking support</span>
              <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400">
              Daniel Lee, Adam Firdaus, Kumar Raj and 2 others require confidence practice.
            </p>
          </div>

          {/* Yellow Alert: Writing */}
          <div
            onClick={() => setCurrentView('student-list')}
            className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 hover:border-amber-600 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-amber-300">🟡 3 pupils need Writing support</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400">
              Nur Iman and 2 others need sentence structure and capitalization scaffolding.
            </p>
          </div>

          {/* Green Alert: Improvement */}
          <div
            onClick={() => setCurrentView('analytics')}
            className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 hover:border-emerald-600 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-emerald-300">🟢 12 pupils show improvement</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400">
              Progress detected this month (e.g. TP2 → TP3/TP4 in monthly assessments).
            </p>
          </div>
        </div>
      </div>

      {/* Operational Status Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Weekly Completion */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Weekly Task Completion</span>
            <div className="text-lg font-extrabold text-white">82% Completed</div>
          </div>
        </div>

        {/* Pending Evidence */}
        <div
          onClick={() => setCurrentView('evidence-portfolio')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center gap-3 cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Evidence Review</span>
            <div className="text-lg font-extrabold text-white">{pendingEvidence.length} Items To Check</div>
          </div>
        </div>

        {/* Pending Teacher Validation */}
        <div
          onClick={() => setCurrentView('quick-assess')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center gap-3 cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">PBD Validation Needed</span>
            <div className="text-lg font-extrabold text-white">{pendingValidationCount} AI Baselines</div>
          </div>
        </div>

        {/* Active Interventions */}
        <div
          onClick={() => setCurrentView('intervention')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center gap-3 cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Interventions</span>
            <div className="text-lg font-extrabold text-white">{interventions.length} Enrolled</div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => setCurrentView('quick-assess')}
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-600/40 hover:border-blue-400 shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-extrabold text-base text-white">Record Quick PBD TP</h4>
          <p className="text-xs text-slate-400 mt-1">
            Assess speaking, reading, writing or listening for a pupil with notes and evidence attachment.
          </p>
        </div>

        <div
          onClick={() => setCurrentView('ai-insights')}
          className="p-5 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-slate-900 border border-cyan-600/40 hover:border-cyan-400 shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-cyan-600 text-white shadow-md">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-extrabold text-base text-white">Class AI Insights</h4>
          <p className="text-xs text-slate-400 mt-1">
            Review automatic AI diagnosis on 4 Bestari and assign recommended interventions in 1 click.
          </p>
        </div>

        <div
          onClick={() => setCurrentView('reports')}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-600/40 hover:border-indigo-400 shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md">
              <FileCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-extrabold text-base text-white">Generate PBD Reports</h4>
          <p className="text-xs text-slate-400 mt-1">
            Produce print-ready summary reports and export structured data as reference for idMe entry.
          </p>
        </div>
      </div>

      {/* Export PBD as PDF Modal */}
      <ExportPBDPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        defaultClassId={selectedClassId}
      />

      {/* Personalise Profile Modal */}
      <PersonaliseProfileModal
        isOpen={isPersonaliseOpen}
        onClose={() => setIsPersonaliseOpen(false)}
        defaultTab="profile"
      />

      {/* Admin Spreadsheet Modal - Gated to Admin and Invited Email */}
      <AdminSpreadsheetModal
        isOpen={isAdminSpreadsheetOpen}
        onClose={() => setIsAdminSpreadsheetOpen(false)}
        currentUserEmail={teacherProfile?.email}
      />

      {/* Teacher Notifications Modal */}
      <TeacherNotificationModal
        isOpen={isTeacherNotificationOpen}
        onClose={() => setIsTeacherNotificationOpen(false)}
        onOpenClassManager={() => setCurrentView('class-management')}
      />
    </div>
  );
};
