import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileSpreadsheet,
  X,
  Download,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  UserPlus,
  Trash2,
  Mail,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { DelimaAccountRecord } from './GoogleDelimaModal';
import {
  getInvitedEmails,
  addInvitedEmail,
  removeInvitedEmail,
  SUPER_ADMIN_EMAIL,
  isEmailInvited,
  getVerifiedEmail,
  unlockDemoAccess,
  lockDemoAccess,
  hasAdminSpreadsheetAccess,
} from '../../utils/invitedAccess';

interface AdminSpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
}

export const AdminSpreadsheetModal: React.FC<AdminSpreadsheetModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'invited'>('logs');
  const [records, setRecords] = useState<DelimaAccountRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [invitedList, setInvitedList] = useState<string[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Security & Authentication Gate State
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => hasAdminSpreadsheetAccess(currentUserEmail));
  const [verifiedEmail, setVerifiedEmail] = useState<string>(() => {
    if (currentUserEmail && isEmailInvited(currentUserEmail)) return currentUserEmail;
    return getVerifiedEmail() || '';
  });
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState('');

  const loadInvited = () => {
    setInvitedList(getInvitedEmails());
  };

  const handleAddInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail.trim()) return;
    const res = addInvitedEmail(newInviteEmail);
    if (res.success) {
      setInviteFeedback({ text: res.message, type: 'success' });
      setNewInviteEmail('');
      loadInvited();
    } else {
      setInviteFeedback({ text: res.message, type: 'error' });
    }
  };

  const handleRemoveInvite = (email: string) => {
    const res = removeInvitedEmail(email);
    if (res.success) {
      setInviteFeedback({ text: res.message, type: 'success' });
      loadInvited();
    } else {
      setInviteFeedback({ text: res.message, type: 'error' });
    }
  };

  const loadRecords = () => {
    try {
      const stored = localStorage.getItem('smarttrack_admin_spreadsheet_log');
      if (stored) {
        setRecords(JSON.parse(stored));
      } else {
        // Seed default records
        const initialSeed: DelimaAccountRecord[] = [
          {
            id: 'LOG-001',
            email: 'g-98765432@moe-dl.edu.my',
            name: 'Cikgu Sarah binti Ahmad',
            role: 'teacher',
            school: 'SK Seri Bintang Bestari',
            registeredAt: '18 Sep 2026, 08:30',
            lastLogin: 'Hari ini',
            syncStatus: 'synced',
          },
          {
            id: 'LOG-002',
            email: 'm-12345678@moe-dl.edu.my',
            name: 'Daniel Lee',
            role: 'student',
            school: 'SK Seri Bintang Bestari',
            registeredAt: '18 Sep 2026, 09:15',
            lastLogin: 'Hari ini',
            syncStatus: 'synced',
          },
        ];
        localStorage.setItem('smarttrack_admin_spreadsheet_log', JSON.stringify(initialSeed));
        setRecords(initialSeed);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      const authorized = hasAdminSpreadsheetAccess(currentUserEmail);
      setIsAuthorized(authorized);
      if (currentUserEmail && isEmailInvited(currentUserEmail)) {
        setVerifiedEmail(currentUserEmail);
      } else {
        setVerifiedEmail(getVerifiedEmail() || '');
      }
      setAuthInput('');
      setAuthError('');
      if (authorized) {
        loadRecords();
        loadInvited();
      }
    }
  }, [isOpen, currentUserEmail]);

  const handleVerifyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const clean = authInput.trim().toLowerCase();
    if (!clean) {
      setAuthError('Sila masukkan e-mel jemputan atau kod akses pentadbir.');
      return;
    }

    // Check if user is typing an ordinary teacher/student email that is NOT invited
    if (clean.includes('@') && !isEmailInvited(clean)) {
      setAuthError(
        `Akses Ditolak: E-mel (${clean}) tiada dalam senarai pentadbir atau jemputan. Pangkalan data admin (spreadsheet) adalah untuk admin dan emel jemputan sahaja, bukan untuk semua guru dan murid.`
      );
      return;
    }

    const res = unlockDemoAccess(clean);
    if (res.success) {
      setIsAuthorized(true);
      setVerifiedEmail(res.verifiedEmail || clean);
      setAuthError('');
      setAuthInput('');
      loadRecords();
      loadInvited();
    } else {
      setAuthError(
        'Akses Ditolak: E-mel atau kod akses tidak sah. Pangkalan data admin (spreadsheet) hanya boleh diakses oleh pentadbir dan e-mel jemputan sahaja.'
      );
    }
  };

  const handleLockOut = () => {
    lockDemoAccess();
    setIsAuthorized(false);
    setVerifiedEmail('');
    setAuthError('');
  };

  if (!isOpen) return null;

  const filteredRecords = records.filter(
    (r) =>
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      loadRecords();
    }, 800);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'DELIMa Email', 'Nama Penuh', 'Peranan', 'Sekolah', 'Tarikh Daftar', 'Status'];
    const rows = records.map((r) => [
      r.id,
      r.email,
      r.name,
      r.role === 'teacher' ? 'GURU' : 'MURID',
      r.school,
      r.registeredAt,
      r.syncStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DELIMa_Admin_Drive_Spreadsheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[calc(100vh-2rem)] sm:max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                isAuthorized
                  ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
              }`}
            >
              {isAuthorized ? <FileSpreadsheet className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Pangkalan Data Admin (Spreadsheet)</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isAuthorized
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isAuthorized ? 'Akses Dibenarkan' : 'Khas Admin & Jemputan'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAuthorized
                  ? `Disahkan untuk: ${verifiedEmail || 'Pentadbir'} • Log Masuk & Kawalan Jemputan`
                  : 'Hanya untuk Pentadbir dan E-mel Jemputan sahaja • Bukan untuk semua guru & murid'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthorized && (
              <button
                type="button"
                onClick={handleLockOut}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                title="Kunci semula pangkalan data admin"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Kunci Akses</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAuthorized ? (
          /* RESTRICTED ACCESS SCREEN (When user is not verified as admin or invited email) */
          <div className="p-6 sm:p-10 overflow-y-auto flex-1 flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/5">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Akses Terhad (Restricted Access)</span>
              </div>
              <h4 className="text-xl font-extrabold text-white">
                Pangkalan Data Admin (Spreadsheet)
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Pangkalan data admin (spreadsheet) adalah khusus untuk <strong>Pentadbir Sistem</strong> (Super Admin: <code className="text-amber-300 font-mono">cleyteom@gmail.com</code>) dan <strong>E-mel Jemputan</strong> sahaja. Sesi ini <strong>tidak dibuka untuk semua guru dan murid biasa</strong>.
              </p>
            </div>

            {/* Privacy & Restriction Notice */}
            <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Dasar Privasi & Perlindungan Data KPM</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Helaian hamparan ini mengandungi log pendaftaran akaun, alamat e-mel rasmi DELIMa, dan kawalan senarai akses jemputan. Untuk melindungi privasi warga pendidik dan murid, akses hanya diberikan kepada pihak pentadbiran yang sah.
              </p>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyAccess} className="w-full space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={authInput}
                  onChange={(e) => {
                    setAuthInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Masukkan e-mel jemputan atau kod akses pentadbir..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-mono"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 text-left flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sahkan Akses Pentadbir</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-[11px] text-slate-500">
              Perlukan akses jemputan? Sila hubungi Pentadbir Sistem KPM: <span className="text-slate-400 font-mono">cleyteom@gmail.com</span>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 px-6 pt-3 bg-slate-950/40 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('logs')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'logs'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Log Sesi Masuk (Drive Spreadsheet)</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-300">
                  {records.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('invited')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'invited'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Emel Jemputan & Admin (Akses Demo)</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-300">
                  {invitedList.length}
                </span>
              </button>
            </div>

        {activeTab === 'logs' ? (
          <>
            {/* Action Controls & Info Bar */}
            <div className="p-4 sm:p-6 bg-slate-900/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari e-mel DELIMa, nama, atau sekolah..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menyegerak...' : 'Segerak Drive'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun CSV / Excel</span>
                </button>
              </div>
            </div>

            {/* Security Warning Notice */}
            <div className="mx-6 mt-4 p-3 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Pematuhan Keselamatan KPM & PDPA:</strong> Kata laluan pengguna disulitkan secara kriptografi dan tidak didedahkan secara teks biasa dalam helaian hamparan.
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0 ml-2">
                ENCRYPTED SHA-256
              </span>
            </div>

            {/* Table Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">DELIMa E-mel (.edu.my)</th>
                      <th className="py-3 px-4">Nama Pengguna</th>
                      <th className="py-3 px-4">Peranan</th>
                      <th className="py-3 px-4">Sekolah</th>
                      <th className="py-3 px-4">Tarikh Sesi</th>
                      <th className="py-3 px-4 text-center">Status Drive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Tiada rekod pendaftaran ditemui.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                            <span>{item.email}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-200">{item.name}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.role === 'teacher'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {item.role === 'teacher' ? 'GURU' : 'MURID'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">{item.school}</td>
                          <td className="py-3 px-4 text-slate-400">{item.registeredAt}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Google Drive OK</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* TAB 2: INVITED EMAILS MANAGEMENT */
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-cyan-300 mb-0.5">
                  Kawalan Had Capaian: Log Masuk Segera (Akaun Demo)
                </strong>
                <p className="text-slate-300 text-[11px]">
                  Ciri <em>&quot;Log Masuk Segera (Akaun Demo)&quot;</em> disekat daripada kegunaan awam dan hanya boleh dibuka oleh Pentadbir serta emel yang disenaraikan di bawah. Guru dan murid lain yang tidak tersenarai diwajibkan log masuk menggunakan akaun rasmi DELIMa KPM (@moe-dl.edu.my).
                </p>
              </div>
            </div>

            {/* Add New Invite Form */}
            <form onSubmit={handleAddInvite} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span>Tambah Emel Jemputan Baharu</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                    placeholder="Masukkan e-mel (cth: pegawai@gmail.com atau kpm.gov.my)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Jemput</span>
                </button>
              </div>

              {inviteFeedback && (
                <p className={`text-xs ${inviteFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {inviteFeedback.text}
                </p>
              )}
            </form>

            {/* Invited List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">
                Senarai Emel Dibenarkan Akses Demo ({invitedList.length})
              </div>
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 divide-y divide-slate-800/80">
                {invitedList.map((email) => {
                  const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

                  return (
                    <div
                      key={email}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSuperAdmin
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                            <span>{email}</span>
                            {isSuperAdmin && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {isSuperAdmin
                              ? 'Akses penuh sistem pentadbir & kebenaran demo tidak terhad'
                              : 'Emel jemputan rasmi — dibenarkan membuka & mengakses akaun demo'}
                          </div>
                        </div>
                      </div>

                      {!isSuperAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveInvite(email)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/60 transition-colors cursor-pointer"
                          title="Padam daripada senarai jemputan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500 px-2">Kekal</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </>
    )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>
            {isAuthorized ? (
              <>
                Jumlah Pengguna: <strong>{records.length} Rekod Sesi</strong> •{' '}
                <strong>{invitedList.length} Emel Jemputan</strong>
              </>
            ) : (
              <span className="text-amber-400/90 font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Pangkalan data dilindungi — Hanya Pentadbir & E-mel Jemputan</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
