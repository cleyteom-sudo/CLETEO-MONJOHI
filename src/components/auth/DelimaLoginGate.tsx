import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  GraduationCap,
  Sparkles,
  ArrowRight,
  School,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  KeyRound,
  User,
  FileSpreadsheet,
  LogIn,
  Clock,
  ShieldAlert,
  Unlock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { GoogleDelimaModal, DelimaAccountRecord } from './GoogleDelimaModal';
import { AdminSpreadsheetModal } from './AdminSpreadsheetModal';
import {
  isDemoAccessUnlocked,
  unlockDemoAccess,
  lockDemoAccess,
  getVerifiedEmail,
  isEmailInvited,
  SUPER_ADMIN_EMAIL,
} from '../../utils/invitedAccess';

export const DelimaLoginGate: React.FC = () => {
  const { loginWithDelima, enrollStudentWithDelima, classes, students } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeRole, setActiveRole] = useState<UserRole>('teacher');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [studentYear, setStudentYear] = useState<number>(4);
  const [studentClassSelect, setStudentClassSelect] = useState<string>('4 BESTARI');
  const [customClassInput, setCustomClassInput] = useState<string>('');
  const [targetTeacher, setTargetTeacher] = useState<string>('Madam Sarah binti Abdullah');
  const [customTeacher, setCustomTeacher] = useState<string>('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isAdminSpreadsheetOpen, setIsAdminSpreadsheetOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isDemoAccessUnlocked());
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(() => getVerifiedEmail());
  const [showUnlockBox, setShowUnlockBox] = useState(false);
  const [unlockInput, setUnlockInput] = useState('');
  const [unlockMessage, setUnlockMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [savedAccount, setSavedAccount] = useState<{
    email: string;
    name: string;
    role: UserRole;
    school: string;
    savedAt: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('smarttrack_saved_delima_account');
      if (stored) {
        setSavedAccount(JSON.parse(stored));
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Comprehensive validator for DELIMa and Malaysian educational domains (.edu.my)
  const validateDelimaEmail = (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) {
      return {
        valid: false,
        message: 'Sila masukkan ID DELIMa atau e-mel rasmi KPM anda.',
      };
    }

    const isEduMy = clean.endsWith('.edu.my');
    const isMoeDl = clean.endsWith('@moe-dl.edu.my');
    const isGovMy = clean.endsWith('@moe.gov.my') || clean.endsWith('.gov.my');
    const hasValidPrefix = clean.startsWith('g-') || clean.startsWith('m-');
    const isInvited = isEmailInvited(clean);

    if (!isEduMy && !isMoeDl && !isGovMy && !hasValidPrefix && !isInvited) {
      return {
        valid: false,
        message:
          'Ralat Akses: Sila gunakan akaun rasmi DELIMa KPM (@moe-dl.edu.my) atau domain pendidikan Malaysia (.edu.my). Domain awam seperti @gmail.com tidak dibenarkan bagi melindungi privasi data murid.',
      };
    }

    return { valid: true, message: '' };
  };

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    setErrorMessage(null);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockMessage(null);
    const res = unlockDemoAccess(unlockInput);
    if (res.success) {
      setIsUnlocked(true);
      setVerifiedEmail(res.verifiedEmail || 'Pentadbir');
      setUnlockMessage({ text: res.message, type: 'success' });
      setShowUnlockBox(false);
      setUnlockInput('');
    } else {
      setUnlockMessage({ text: res.message, type: 'error' });
    }
  };

  const handleLockDemo = () => {
    lockDemoAccess();
    setIsUnlocked(false);
    setVerifiedEmail(null);
    setShowUnlockBox(false);
    setUnlockMessage(null);
  };

  const recordToAdminSpreadsheet = (email: string, name: string, role: UserRole, school: string) => {
    try {
      const existing = localStorage.getItem('smarttrack_admin_spreadsheet_log');
      const records: DelimaAccountRecord[] = existing ? JSON.parse(existing) : [];

      const newRecord: DelimaAccountRecord = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        email,
        name,
        role,
        school,
        registeredAt: new Date().toLocaleDateString('ms-MY', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        lastLogin: 'Baru sahaja',
        syncStatus: 'synced',
      };

      const updated = [newRecord, ...records.filter((r) => r.email !== email)];
      localStorage.setItem('smarttrack_admin_spreadsheet_log', JSON.stringify(updated));
    } catch {
      // Safe fallback
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    const validation = validateDelimaEmail(cleanEmail);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    setErrorMessage(null);
    const resolvedName =
      customName.trim() ||
      (activeRole === 'teacher' ? 'Cikgu Sarah binti Ahmad' : 'Daniel Lee');
    const school = 'SK Seri Bintang Bestari';

    // Save for future auto sign-in
    localStorage.setItem(
      'smarttrack_saved_delima_account',
      JSON.stringify({
        email: cleanEmail,
        name: resolvedName,
        role: activeRole,
        school,
        savedAt: new Date().toISOString(),
      })
    );

    recordToAdminSpreadsheet(cleanEmail, resolvedName, activeRole, school);

    const resolvedClass =
      activeRole === 'student'
        ? studentClassSelect === 'custom'
          ? customClassInput.trim() || '4 BESTARI'
          : studentClassSelect
        : undefined;
    const resolvedYear = activeRole === 'student' ? studentYear : undefined;

    const finalTeacher =
      targetTeacher === 'custom'
        ? customTeacher.trim() || 'Madam Sarah binti Abdullah'
        : targetTeacher;

    if (activeRole === 'student' && resolvedClass && resolvedYear) {
      enrollStudentWithDelima({
        name: resolvedName,
        email: cleanEmail,
        className: resolvedClass,
        year: resolvedYear,
        school,
        targetTeacher: finalTeacher,
      });
    }

    loginWithDelima(activeRole, cleanEmail, resolvedName, school, resolvedClass, resolvedYear);
  };

  const handleResumeSavedSession = () => {
    if (savedAccount) {
      loginWithDelima(
        savedAccount.role,
        savedAccount.email,
        savedAccount.name,
        savedAccount.school
      );
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    if (role === 'teacher') {
      recordToAdminSpreadsheet(
        'g-98765432@moe-dl.edu.my',
        'Cikgu Sarah binti Ahmad',
        'teacher',
        'SK Seri Bintang Bestari'
      );
      loginWithDelima(
        'teacher',
        'g-98765432@moe-dl.edu.my',
        'Cikgu Sarah binti Ahmad',
        'SK Seri Bintang Bestari'
      );
    } else {
      recordToAdminSpreadsheet(
        'm-12345678@moe-dl.edu.my',
        'Daniel Lee',
        'student',
        'SK Seri Bintang Bestari'
      );
      loginWithDelima(
        'student',
        'm-12345678@moe-dl.edu.my',
        'Daniel Lee',
        'SK Seri Bintang Bestari',
        '4 BESTARI',
        4
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-slate-950 via-[#070b19] to-[#0d142c] text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
              <span>ENGLISH AI SMARTTRACK</span>
              <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full uppercase">
                MOE DELIMa 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Kementerian Pendidikan Malaysia (KPM) • Pentaksiran Bilik Darjah (PBD)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Spreadsheet Viewer Button - Restricted to Admin & Invited Email */}
          <button
            type="button"
            onClick={() => setIsAdminSpreadsheetOpen(true)}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 px-3 py-1.5 rounded-full border border-emerald-800/60 transition-all cursor-pointer"
            title="Pangkalan Data Admin (Spreadsheet) — Khas untuk Admin & E-mel Jemputan Sahaja"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Pangkalan Data Admin</span>
            <span className="text-[10px] text-amber-300 bg-amber-950/70 border border-amber-700/60 px-1.5 py-0.2 rounded font-bold">
              Admin & Jemputan
            </span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pengesahan DELIMa Berpusat</span>
          </div>
        </div>
      </header>

      {/* Central Login Card */}
      <div className="max-w-md w-full mx-auto my-8 relative z-10">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Top Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Log Masuk DELIMa</h2>
                <p className="text-[11px] text-slate-400">Portal Rasmi Guru & Murid KPM</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              *.edu.my Sah
            </span>
          </div>

          {/* PRIMARY: GOOGLE DELIMA POP-UP AUTHENTICATION BUTTON */}
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 cursor-pointer group"
            >
              {/* Google G Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27A7.18 7.18 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <div className="text-left">
                <span className="block text-slate-900 group-hover:text-blue-600 font-extrabold text-[13px]">
                  Log Masuk dengan Google DELIMa
                </span>
                <span className="block text-[10px] text-slate-500 font-normal">
                  Pop-up akaun guru & murid (@moe-dl.edu.my)
                </span>
              </div>
            </button>
          </div>

          {/* Quick Resume Saved Account if exists */}
          {savedAccount && (
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-500/40">
                  {savedAccount.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{savedAccount.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                      {savedAccount.role === 'teacher' ? 'Guru' : 'Murid'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{savedAccount.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResumeSavedSession}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm transition-all"
              >
                Sambung
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-[1px] bg-slate-800" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              atau borang DELIMa manual
            </span>
            <div className="flex-1 h-[1px] bg-slate-800" />
          </div>

          {/* Auth Mode & Role Switchers */}
          <div className="space-y-2 mb-4">
            {/* Mode Switcher: Log Masuk vs Daftar Murid */}
            <div className="grid grid-cols-2 rounded-2xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setActiveRole('student');
                }}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'signup'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Daftar Murid Baharu
              </button>
            </div>

            {/* Role Switcher Pill (only in login mode) */}
            {authMode === 'login' && (
              <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('teacher')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeRole === 'teacher'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>GURU (Teacher)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeRole === 'student'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>MURID (Student)</span>
                </button>
              </div>
            )}
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 mb-4 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login / Signup Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ID Pengguna DELIMa / Domain .edu.my
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={
                    activeRole === 'teacher'
                      ? 'g-98765432@moe-dl.edu.my'
                      : 'm-12345678@moe-dl.edu.my'
                  }
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Menerima <code>@moe-dl.edu.my</code> dan semua domain pendidikan <code>*.edu.my</code>
              </span>
            </div>

            {/* Matched Spreadsheet Student Notice */}
            {emailInput.trim() &&
              students.some(
                (s) => s.email && s.email.trim().toLowerCase() === emailInput.trim().toLowerCase()
              ) && (() => {
                const matched = students.find(
                  (s) => s.email && s.email.trim().toLowerCase() === emailInput.trim().toLowerCase()
                )!;
                return (
                  <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 flex items-start gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-cyan-300">Rekod Murid Dikesan Dari Spreadsheet</div>
                      <div className="text-[11px] text-cyan-100/90 mt-0.5">
                        {matched.name} • Kelas <strong>{matched.className}</strong> (Tahun {matched.year})
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomName(matched.name);
                          setStudentClassSelect(matched.className);
                          setStudentYear(matched.year);
                        }}
                        className="mt-1.5 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] transition-all cursor-pointer"
                      >
                        Segerakkan Profil Ini
                      </button>
                    </div>
                  </div>
                );
              })()}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {activeRole === 'student' ? 'Nama Penuh Murid' : 'Nama Pengguna'}
                {activeRole === 'student' && <span className="text-rose-400 ml-1">*</span>}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={
                    activeRole === 'teacher'
                      ? 'Cikgu Sarah binti Ahmad'
                      : 'Contoh: Nur Aisyah binti Azman'
                  }
                  required={activeRole === 'student'}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Student Enrollment Details: Year & Class */}
            {activeRole === 'student' && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                <div className="text-xs font-black text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <School className="w-4 h-4 text-emerald-400" />
                    <span>Maklumat Enrolmen Kelas & Tahun</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Auto-Sync
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Tahun Persekolahan
                    </label>
                    <select
                      value={studentYear}
                      onChange={(e) => setStudentYear(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:border-emerald-500 outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((y) => (
                        <option key={y} value={y}>
                          Tahun {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Nama Kelas
                    </label>
                    <select
                      value={studentClassSelect}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudentClassSelect(val);
                        // Auto detect year from class name if format "3 INOVATIF" or "4 BESTARI"
                        const match = val.match(/^(\d+)/);
                        if (match) {
                          setStudentYear(Number(match[1]));
                        }
                      }}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:border-emerald-500 outline-none"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} (Thn {c.year})
                        </option>
                      ))}
                      <option value="custom">+ Taip Kelas Lain / Baharu (cth: 3 INOVATIF)</option>
                    </select>
                  </div>
                </div>

                {studentClassSelect === 'custom' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Nama Kelas Baharu (cth: 3 INOVATIF)
                    </label>
                    <input
                      type="text"
                      value={customClassInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomClassInput(val);
                        const match = val.match(/^(\d+)/);
                        if (match) {
                          setStudentYear(Number(match[1]));
                        }
                      }}
                      placeholder="Contoh: 3 INOVATIF"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:border-emerald-500 outline-none"
                    />
                  </div>
                )}

                {/* Teacher Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Pilih Guru Kelas (Teacher to Enroll In)
                  </label>
                  <select
                    value={targetTeacher}
                    onChange={(e) => setTargetTeacher(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Madam Sarah binti Abdullah">Madam Sarah binti Abdullah (Ketua Panitia BI)</option>
                    <option value="Mr. Daniel Wong">Mr. Daniel Wong (Guru Bahasa Inggeris)</option>
                    <option value="Puan Noraini binti Yusof">Puan Noraini binti Yusof (Guru Bahasa Inggeris)</option>
                    <option value="custom">+ Taip Nama Guru Lain</option>
                  </select>
                </div>

                {targetTeacher === 'custom' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Nama Guru Bahasa Inggeris
                    </label>
                    <input
                      type="text"
                      value={customTeacher}
                      onChange={(e) => setCustomTeacher(e.target.value)}
                      placeholder="Contoh: Cikgu Khairul Anuar"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:border-emerald-500 outline-none"
                      required
                    />
                  </div>
                )}

                {/* Real-time verification notice */}
                {(() => {
                  const resolved =
                    studentClassSelect === 'custom'
                      ? customClassInput.trim()
                      : studentClassSelect;
                  if (!resolved) return null;

                  const isExisting = classes.some(
                    (c) =>
                      c.name.trim().toUpperCase() === resolved.toUpperCase() ||
                      c.name.trim().toUpperCase() === `${studentYear} ${resolved.toUpperCase()}` ||
                      `${c.year} ${c.name.trim().toUpperCase()}` === resolved.toUpperCase()
                  );

                  return (
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                        isExisting
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                          : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                      }`}
                    >
                      {isExisting ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-emerald-300">Kelas Sedia Ada Dikesan: </span>
                            Murid akan <strong>diautomatikkan enrol</strong> ke dalam kelas "{resolved}" (Tahun {studentYear}) berdasarkan pangkalan data sistem.
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-300">Pemberitahuan Kelas Baharu: </span>
                            Kelas "{resolved}" (Tahun {studentYear}) <strong>belum wujud</strong> dalam sistem. Notifikasi pendaftaran akan dihantar serta-merta kepada Guru / Pentadbir untuk mewujudkan kelas ini.
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">Kata Laluan DELIMa</label>
                <span className="text-[10px] text-cyan-400 hover:underline cursor-pointer">
                  Lupa kata laluan?
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer mt-1 ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 shadow-blue-500/25'
              }`}
            >
              <span>
                {authMode === 'signup'
                  ? 'DAFTAR & ENROL KE KELAS'
                  : 'MASUK PORTAL DELIMa / KPM'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Fast Login Presets (Restricted to Admin and Invited Emails Only) */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            {isUnlocked ? (
              <div>
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-left mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Akaun Demo Dibuka (Admin / Jemputan)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleLockDemo}
                      className="text-[10px] text-slate-400 hover:text-rose-300 underline cursor-pointer"
                    >
                      Kunci Semula
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Disahkan: <span className="font-mono font-bold text-cyan-200">{verifiedEmail || 'Pentadbir'}</span>. Akses demo pantas aktif:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('teacher')}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    <span>Guru (Cikgu Sarah)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('student')}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Murid (Daniel Lee)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Public restricted view */
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-300">
                      Log Masuk Segera (Akaun Demo)
                    </span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase">
                    Akses Terhad
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Ciri akaun demo hanya tersedia untuk Pentadbir dan emel yang dijemput khas. Guru dan murid lain perlu log masuk menggunakan ID akaun DELIMa KPM (@moe-dl.edu.my).
                </p>

                {!showUnlockBox ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnlockBox(true);
                      setUnlockMessage(null);
                    }}
                    className="mt-2 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Sahkan Emel Pentadbir / Jemputan untuk Buka Demo</span>
                  </button>
                ) : (
                  <form onSubmit={handleUnlockSubmit} className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={unlockInput}
                        onChange={(e) => setUnlockInput(e.target.value)}
                        placeholder="cth: cleyteom@gmail.com"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Buka
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUnlockBox(false);
                          setUnlockMessage(null);
                        }}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>

                    {unlockMessage && (
                      <p
                        className={`text-[10px] ${
                          unlockMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {unlockMessage.text}
                      </p>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer disclaimer */}
        <p className="text-center text-[10px] text-slate-500 mt-4 leading-relaxed">
          Sistem Pintar Pentaksiran Bilik Darjah (PBD) Bersepadu • Butiran disegerakkan ke Spreadsheet Google Drive Admin.
        </p>
      </div>

      {/* Google DELIMa Modal */}
      <GoogleDelimaModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={(role, email, name, school, className, year, modalTeacher) => {
          setIsGoogleModalOpen(false);
          const finalTeacher = modalTeacher || targetTeacher || 'Madam Sarah binti Abdullah';
          if (role === 'student' && className && year) {
            enrollStudentWithDelima({
              name,
              email,
              className,
              year,
              school,
              targetTeacher: finalTeacher,
            });
          }
          loginWithDelima(role, email, name, school, className, year);
        }}
        initialRole={activeRole}
        existingClasses={classes.map((c) => c.name)}
      />

      {/* Admin Spreadsheet Viewer Modal - Gated to Admin and Invited Email */}
      <AdminSpreadsheetModal
        isOpen={isAdminSpreadsheetOpen}
        onClose={() => setIsAdminSpreadsheetOpen(false)}
        currentUserEmail={verifiedEmail || undefined}
      />

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto w-full py-2 text-center text-xs text-slate-600 border-t border-slate-900">
        © 2026 Kementerian Pendidikan Malaysia • English AI SmartTrack • Inovasi PBD Digital
      </footer>
    </div>
  );
};

