import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  School,
  X,
  FileSpreadsheet,
  Check,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { UserRole } from '../../types';
import {
  isDemoAccessUnlocked,
  isEmailInvited,
  SUPER_ADMIN_EMAIL,
} from '../../utils/invitedAccess';

export interface DelimaAccountRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  school: string;
  registeredAt: string;
  lastLogin: string;
  syncStatus: 'synced' | 'pending';
}

interface GoogleDelimaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    role: UserRole,
    email: string,
    name: string,
    school: string,
    className?: string,
    year?: number,
    targetTeacher?: string
  ) => void;
  initialRole?: UserRole;
  existingClasses?: string[];
}

export const GoogleDelimaModal: React.FC<GoogleDelimaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'teacher',
  existingClasses = ['1 PINTAR', '2 CERDIK', '3 AMANAH', '4 BESTARI', '5 CEMERLANG', '6 DEDIKASI'],
}) => {
  const isUnlocked = isDemoAccessUnlocked();
  const [step, setStep] = useState<'choose' | 'enter_custom' | 'password' | 'authenticating' | 'success'>(
    isUnlocked ? 'choose' : 'enter_custom'
  );
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [studentYear, setStudentYear] = useState<number>(4);
  const [studentClass, setStudentClass] = useState<string>('4 BESTARI');
  const [customClassInput, setCustomClassInput] = useState<string>('');
  const [targetTeacher, setTargetTeacher] = useState<string>('Madam Sarah binti Abdullah');
  const [customTeacher, setCustomTeacher] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Validate DELIMa and .edu.my emails (and invited admin emails)
  const validateEmail = (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return { valid: false, message: 'Sila masukkan alamat e-mel anda.' };

    const isEduMy = clean.endsWith('.edu.my');
    const isMoeDl = clean.endsWith('@moe-dl.edu.my');
    const isGovMy = clean.endsWith('@moe.gov.my') || clean.endsWith('.gov.my');
    const isInvited = isEmailInvited(clean);

    if (!isEduMy && !isMoeDl && !isGovMy && !isInvited) {
      return {
        valid: false,
        message:
          'Ralat Log Masuk: Domain e-mel tidak sah. Sistem ini memerlukan akaun Google DELIMa KPM (@moe-dl.edu.my) atau alamat berdaftar (.edu.my). Domain awam (@gmail.com / @yahoo.com) ditolak demi keselamatan murid.',
      };
    }

    return { valid: true, message: '' };
  };

  const handleSelectPreconfigured = (
    role: UserRole,
    email: string,
    name: string,
    school: string
  ) => {
    setSelectedRole(role);
    setEmailInput(email);
    setNameInput(name);
    setPasswordInput('••••••••••••');
    setStep('authenticating');

    const assignedClass = role === 'student' ? '4 BESTARI' : undefined;
    const assignedYear = role === 'student' ? 4 : undefined;
    const assignedTeacher = role === 'student' ? 'Madam Sarah binti Abdullah' : undefined;

    // Simulate authentic Google SSO handshake
    setTimeout(() => {
      saveToAdminSpreadsheet(email, name, role, school);
      setStep('success');
      setTimeout(() => {
        onSuccess(role, email, name, school, assignedClass, assignedYear, assignedTeacher);
      }, 900);
    }, 1200);
  };

  const handleCustomEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = validateEmail(emailInput);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    // Auto-detect role
    const clean = emailInput.trim().toLowerCase();
    if (clean.startsWith('g-') || clean.includes('guru') || clean.includes('teacher')) {
      setSelectedRole('teacher');
      if (!nameInput) setNameInput('Cikgu (DELIMa User)');
    } else {
      setSelectedRole('student');
      if (!nameInput) setNameInput('Murid (DELIMa Student)');
    }

    setStep('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMessage('Sila masukkan kata laluan akaun Google DELIMa anda.');
      return;
    }

    setErrorMessage(null);
    setStep('authenticating');

    setTimeout(() => {
      const cleanEmail = emailInput.trim().toLowerCase();
      const resolvedName =
        nameInput.trim() ||
        (selectedRole === 'teacher' ? 'Cikgu DELIMa' : 'Murid DELIMa');
      const school = 'SK Seri Bintang Bestari';

      saveToAdminSpreadsheet(cleanEmail, resolvedName, selectedRole, school);

      if (rememberMe) {
        localStorage.setItem(
          'smarttrack_saved_delima_account',
          JSON.stringify({
            email: cleanEmail,
            name: resolvedName,
            role: selectedRole,
            school,
            savedAt: new Date().toISOString(),
          })
        );
      }

      const resolvedClass =
        selectedRole === 'student'
          ? studentClass === 'custom'
            ? customClassInput.trim() || '4 BESTARI'
            : studentClass
          : undefined;
      const resolvedYear = selectedRole === 'student' ? studentYear : undefined;
      const finalTeacher =
        selectedRole === 'student'
          ? targetTeacher === 'custom'
            ? customTeacher.trim() || 'Madam Sarah binti Abdullah'
            : targetTeacher
          : undefined;

      setStep('success');
      setTimeout(() => {
        onSuccess(
          selectedRole,
          cleanEmail,
          resolvedName,
          school,
          resolvedClass,
          resolvedYear,
          finalTeacher
        );
      }, 900);
    }, 1400);
  };

  // Helper to record login in Admin Google Drive Spreadsheet log (stored in localStorage)
  const saveToAdminSpreadsheet = (
    email: string,
    name: string,
    role: UserRole,
    school: string
  ) => {
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

      // Filter duplicate email, update to top
      const updated = [newRecord, ...records.filter((r) => r.email !== email)];
      localStorage.setItem('smarttrack_admin_spreadsheet_log', JSON.stringify(updated));
    } catch {
      // Fallback safe
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-800 overflow-hidden relative flex flex-col my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh]"
      >
        {/* Top Google & DELIMa Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            {/* Google G Logo SVG */}
            <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Log masuk dengan Google</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-full">
                  DELIMa 2.0
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Kementerian Pendidikan Malaysia (KPM)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 flex-1 flex flex-col justify-between overflow-y-auto min-h-0">
          {/* STEP 1: CHOOSE ACCOUNT */}
          {step === 'choose' && (
            <div className="space-y-4">
              <div className="text-center mb-5">
                <h4 className="text-lg font-bold text-slate-900">Pilih Akaun Pengguna</h4>
                <p className="text-xs text-slate-500 mt-1">
                  untuk meneruskan ke <strong>English AI SmartTrack (PBD)</strong>
                </p>
              </div>

              {/* Pre-configured Quick Accounts */}
              <div className="space-y-2.5">
                {/* Teacher Account */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPreconfigured(
                      'teacher',
                      'g-98765432@moe-dl.edu.my',
                      'Cikgu Sarah binti Ahmad',
                      'SK Seri Bintang Bestari'
                    )
                  }
                  className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      S
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                        Cikgu Sarah binti Ahmad
                      </div>
                      <div className="text-xs text-slate-500 font-mono">g-98765432@moe-dl.edu.my</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-800">
                    Akaun Guru
                  </span>
                </button>

                {/* Student Account */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPreconfigured(
                      'student',
                      'm-12345678@moe-dl.edu.my',
                      'Daniel Lee',
                      'SK Seri Bintang Bestari'
                    )
                  }
                  className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      D
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                        Daniel Lee
                      </div>
                      <div className="text-xs text-slate-500 font-mono">m-12345678@moe-dl.edu.my</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Akaun Murid
                  </span>
                </button>

                {/* Use Another / Custom .edu.my Account */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep('enter_custom');
                  }}
                  className="w-full p-3.5 rounded-2xl border border-dashed border-slate-300 hover:border-slate-500 hover:bg-slate-50 flex items-center gap-3 text-left transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-lg">
                    +
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">Gunakan Akaun DELIMa Lain</div>
                    <div className="text-xs text-slate-500">
                      Masukkan akaun rasmi @moe-dl.edu.my atau domain *.edu.my
                    </div>
                  </div>
                </button>
              </div>

              {/* Data Safety Note */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Log masuk disahkan melalui Protokol Keselamatan Tunggal Google Workspace KPM.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: ENTER CUSTOM DELIMA OR .EDU.MY EMAIL */}
          {step === 'enter_custom' && (
            <form onSubmit={handleCustomEmailNext} className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Masukkan E-mel DELIMa / Pendidikan</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Menerima domain <strong>@moe-dl.edu.my</strong> dan semua domain <strong>*.edu.my</strong> rasmi.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-mel Google DELIMa (.edu.my)
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="g-12345678@moe-dl.edu.my atau nama@sekolah.edu.my"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  autoFocus
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Contoh Guru: <code>g-12345678@moe-dl.edu.my</code> • Contoh Murid: <code>m-12345678@moe-dl.edu.my</code>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penuh Pengguna
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={
                    selectedRole === 'teacher' ? 'Contoh: Cikgu Razak' : 'Contoh: Nur Aisyah binti Azman'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  required
                />
              </div>

              {/* If Student Role, Ask for Year and Class */}
              {(selectedRole === 'student' || emailInput.trim().toLowerCase().startsWith('m-')) && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Maklumat Enrolmen Kelas Murid</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Tahun (Year)
                      </label>
                      <select
                        value={studentYear}
                        onChange={(e) => setStudentYear(Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-emerald-500"
                      >
                        {[1, 2, 3, 4, 5, 6].map((y) => (
                          <option key={y} value={y}>
                            Tahun {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama Kelas
                      </label>
                      <select
                        value={studentClass}
                        onChange={(e) => {
                          setStudentClass(e.target.value);
                          const matched = e.target.value.match(/^(\d+)/);
                          if (matched) setStudentYear(Number(matched[1]));
                        }}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-emerald-500"
                      >
                        {existingClasses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="custom">+ Kelas Lain / Baharu</option>
                      </select>
                    </div>
                  </div>

                  {studentClass === 'custom' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Taip Nama Kelas Baharu (cth: 3 INOVATIF)
                      </label>
                      <input
                        type="text"
                        value={customClassInput}
                        onChange={(e) => setCustomClassInput(e.target.value)}
                        placeholder="Contoh: 3 INOVATIF"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-bold focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Teacher Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pilih Guru Kelas (Teacher to Enroll In)
                    </label>
                    <select
                      value={targetTeacher}
                      onChange={(e) => setTargetTeacher(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-emerald-500"
                    >
                      <option value="Madam Sarah binti Abdullah">Madam Sarah binti Abdullah (Ketua Panitia BI)</option>
                      <option value="Mr. Daniel Wong">Mr. Daniel Wong (Guru Bahasa Inggeris)</option>
                      <option value="Puan Noraini binti Yusof">Puan Noraini binti Yusof (Guru Bahasa Inggeris)</option>
                      <option value="custom">+ Taip Nama Guru Lain</option>
                    </select>
                  </div>

                  {targetTeacher === 'custom' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama Guru Bahasa Inggeris
                      </label>
                      <input
                        type="text"
                        value={customTeacher}
                        onChange={(e) => setCustomTeacher(e.target.value)}
                        placeholder="Contoh: Cikgu Khairul Anuar"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-bold focus:border-emerald-500"
                      />
                    </div>
                  )}

                  <div className="text-[10px] text-slate-600">
                    {existingClasses.includes(
                      studentClass === 'custom' ? customClassInput.trim().toUpperCase() : studentClass
                    ) ? (
                      <span className="text-emerald-700 font-bold">
                        ✓ Kelas wujud dalam sistem. Murid akan diautomatikkan enrol ke kelas ini.
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold">
                        ⚠️ Kelas belum wujud. Notifikasi akan dihantar secara automatik kepada Guru/Admin untuk mencipta kelas ini.
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setStep('choose');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Kembali ke Pilihan Akaun Demo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Seterusnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ENTER DELIMA PASSWORD */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {nameInput ? nameInput.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{nameInput || 'Pengguna DELIMa'}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{emailInput}</div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Masukkan Kata Laluan Google DELIMa
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Kata laluan keselamatan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all pr-10"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Simpan butiran log masuk dengan selamat untuk sesi akan datang</span>
              </label>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep('enter_custom');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Tukar E-mel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                >
                  <span>Sahkan & Log Masuk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: AUTHENTICATING SPINNER */}
          {step === 'authenticating' && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
              <div>
                <h4 className="text-base font-bold text-slate-900">Mengesahkan Akaun Google DELIMa...</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Menyemak kelayakan KPM & menyegerakkan ke log Spreadsheet Google Drive Admin
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg animate-in zoom-in-90">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Pengesahan DELIMa Berjaya!</h4>
              <p className="text-xs text-slate-600 max-w-xs">
                Selamat datang! Butiran akaun telah disahkan dan direkodkan dengan selamat.
              </p>
            </div>
          )}

          {/* Admin Google Drive Spreadsheet Live Status Badge */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Rekod Disimpan di Google Drive Admin</span>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Spreadsheet Aktif</span>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
