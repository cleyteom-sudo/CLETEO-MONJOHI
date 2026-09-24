import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ClipboardCheck,
  TrendingUp,
  ShieldCheck,
  QrCode,
  Pencil,
  FileText,
  Check,
  X,
  Printer,
  Activity,
  ArrowUpDown,
  User,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, TPLevel } from '../../types';
import { ExportPBDPdfModal } from './ExportPBDPdfModal';

export const StudentList: React.FC<{ onOpenStudentProfile: (student: Student) => void }> = ({
  onOpenStudentProfile,
}) => {
  const {
    students,
    classes,
    selectedClassId,
    setSelectedClassId,
    setSelectedStudentId,
    setCurrentView,
    setQrModalStudent,
    updateStudentName,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'tp-asc' | 'tp-desc' | 'intervention' | 'year'>('name-asc');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const handleStartRename = (std: Student) => {
    setEditingStudentId(std.id);
    setEditNameInput(std.name);
  };

  const handleSaveRename = (studentId: string) => {
    if (editNameInput.trim()) {
      updateStudentName(studentId, editNameInput.trim());
    }
    setEditingStudentId(null);
  };

  // Helper to extract numeric TP
  const getTpNum = (tp: TPLevel) => Number(tp.replace('TP', '')) || 0;

  // Filtering, Sorting & Global Search logic
  const filteredStudents = useMemo(() => {
    const list = students.filter((s) => {
      // Class match: if searching globally or year filter is selected, search widely; else respect currentClass
      const matchesClass = searchQuery || yearFilter !== 'All' ? true : s.className === currentClass.name;

      // Year filter
      if (yearFilter !== 'All' && s.year !== Number(yearFilter)) {
        return false;
      }

      // Search across name, email, class, skills, TP, intervention
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.readingTP.toLowerCase().includes(q) ||
        s.writingTP.toLowerCase().includes(q) ||
        s.listeningTP.toLowerCase().includes(q) ||
        s.speakingTP.toLowerCase().includes(q) ||
        s.overallTP.toLowerCase().includes(q) ||
        (s.interventionSkill && s.interventionSkill.toLowerCase().includes(q));

      // Filter tabs
      let matchesFilter = true;
      if (activeFilter === 'Needs Intervention') {
        matchesFilter = s.interventionStatus === 'Needs Intervention' || s.speakingTP === 'TP2' || s.writingTP === 'TP2';
      } else if (activeFilter === 'Improving') {
        matchesFilter = s.interventionStatus === 'Improving' || s.overallTP === 'TP4' || s.overallTP === 'TP5';
      } else if (activeFilter.startsWith('TP')) {
        matchesFilter = s.overallTP === activeFilter;
      }

      return matchesClass && matchesSearch && matchesFilter;
    });

    // Sort order
    return list.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'tp-asc') return getTpNum(a.overallTP) - getTpNum(b.overallTP);
      if (sortBy === 'tp-desc') return getTpNum(b.overallTP) - getTpNum(a.overallTP);
      if (sortBy === 'intervention') {
        const aNeeds = a.interventionStatus === 'Needs Intervention' ? 1 : 0;
        const bNeeds = b.interventionStatus === 'Needs Intervention' ? 1 : 0;
        return bNeeds - aNeeds;
      }
      if (sortBy === 'year') return a.year - b.year;
      return 0;
    });
  }, [students, currentClass.name, searchQuery, activeFilter, yearFilter, sortBy]);

  const getTPBadge = (tp: TPLevel, isValidated: boolean) => {
    let colorClass = 'bg-slate-800 text-slate-300 border-slate-700';
    if (tp === 'TP1' || tp === 'TP2') {
      colorClass = 'bg-red-500/20 text-red-300 border-red-500/40';
    } else if (tp === 'TP3' || tp === 'TP4') {
      colorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    } else if (tp === 'TP5' || tp === 'TP6') {
      colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }

    return (
      <span
        title={isValidated ? 'Teacher Validated TP (Disahkan Guru)' : 'Cadangan Pintar AI (Perlu Pengesahan)'}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${colorClass}`}
      >
        <span>{tp}</span>
        {isValidated ? (
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
        ) : (
          <Sparkles className="w-3 h-3 text-amber-400" />
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Senarai Murid & Rekod PBD
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {currentClass.name} (Tahun {currentClass.year})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Perekodan 4 kemahiran Bahasa Inggeris, pengesahan guru, cetakan slip ibu bapa dan penjejakan aktiviti murid.
          </p>
        </div>

        {/* Global Search Bar & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari murid, kemahiran, TP..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Import Student Spreadsheet Shortcut */}
          <button
            onClick={() => setCurrentView('class-management')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm"
            title="Import Murid daripada Fail Spreadsheet (.xlsx / .csv)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>IMPORT SPREADSHEET</span>
          </button>

          {/* Export PBD as PDF Button */}
          <button
            onClick={() => setIsExportPdfOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>EXPORT PBD (PDF)</span>
          </button>

          <button
            onClick={() => setCurrentView('quick-assess')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>PENTAKSIRAN PANTAS</span>
          </button>
        </div>
      </div>

      {/* Class and Year Selection Bar */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Tapis Tahun:</span>
          {['All', '1', '2', '3', '4', '5', '6'].map((yr) => (
            <button
              key={yr}
              onClick={() => setYearFilter(yr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                yearFilter === yr
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {yr === 'All' ? 'Semua Tahun' : `Tahun ${yr}`}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-bold text-[11px]">Susunan (Sort):</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="name-asc">Nama (A → Z)</option>
            <option value="name-desc">Nama (Z → A)</option>
            <option value="tp-asc">Tahap Rendah Dahulu (TP1 → TP6)</option>
            <option value="tp-desc">Tahap Tinggi Dahulu (TP6 → TP1)</option>
            <option value="intervention">Perlu Intervensi Dahulu</option>
            <option value="year">Tahun Persekolahan (1 → 6)</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 overflow-x-auto">
        {['All', 'Needs Intervention', 'Improving', 'TP1', 'TP2', 'TP3', 'TP4', 'TP5', 'TP6'].map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === filter
                  ? filter === 'Needs Intervention'
                    ? 'bg-red-600 text-white shadow-md'
                    : filter === 'Improving'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {filter === 'Needs Intervention' ? '⚠️ Perlu Intervensi' : filter === 'Improving' ? '📈 Meningkat' : filter}
            </button>
          )
        )}
      </div>

      {/* PBD Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-300">Status Pengesahan:</span>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Disahkan Guru (Official PBD)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Cadangan Pintar AI (Pending)</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400">
          Memaparkan {filteredStudents.length} daripada {students.length} murid
        </div>
      </div>

      {/* Student List Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-extrabold tracking-wider">
            <tr>
              <th className="p-4">No.</th>
              <th className="p-4">Nama Murid</th>
              <th className="p-4">Reading</th>
              <th className="p-4">Writing</th>
              <th className="p-4">Listening</th>
              <th className="p-4">Speaking</th>
              <th className="p-4">Overall TP</th>
              <th className="p-4">Intervensi</th>
              <th className="p-4">Aktiviti Terkini</th>
              <th className="p-4 text-right">Tindakan Cepat (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredStudents.map((std, idx) => {
              return (
                <tr
                  key={std.id}
                  onClick={() => onOpenStudentProfile(std)}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                >
                  <td className="p-4 font-mono text-slate-400">{idx + 1}</td>

                  {/* Name and Rename */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={std.avatarUrl}
                        alt={std.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        {editingStudentId === std.id ? (
                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editNameInput}
                              onChange={(e) => setEditNameInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(std.id);
                                if (e.key === 'Escape') setEditingStudentId(null);
                              }}
                              autoFocus
                              className="px-2 py-1 rounded-md bg-slate-950 border border-cyan-500 text-white text-xs font-bold focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(std.id)}
                              className="p-1 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 cursor-pointer"
                              title="Simpan Nama"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStudentId(null)}
                              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-white text-xs sm:text-sm group-hover:text-cyan-300 transition-colors">
                              {std.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartRename(std);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Kemaskini nama murid"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono">
                          {std.className} (Tahun {std.year}) • {std.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 4 Skills */}
                  <td className="p-4">{getTPBadge(std.readingTP, std.readingValidated)}</td>
                  <td className="p-4">{getTPBadge(std.writingTP, std.writingValidated)}</td>
                  <td className="p-4">{getTPBadge(std.listeningTP, std.listeningValidated)}</td>
                  <td className="p-4">{getTPBadge(std.speakingTP, std.speakingValidated)}</td>

                  {/* Overall TP */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg font-black text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                      {std.overallTP}
                    </span>
                  </td>

                  {/* Intervention Status */}
                  <td className="p-4">
                    {std.interventionSkill ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          std.interventionStatus === 'Improving'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{std.interventionSkill}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Last Activity */}
                  <td className="p-4 text-slate-400 text-[11px]">{std.lastActive}</td>

                  {/* Actions Column */}
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {/* PRINT PARENT SUMMARY SLIP */}
                      <button
                        onClick={() => {
                          setSelectedStudentId(std.id);
                          setCurrentView('parent-summary');
                        }}
                        className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all cursor-pointer"
                        title="Cetak Slip Rekod PBD Ibu Bapa (Print Summary)"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* ACTIVITY LOG */}
                      <button
                        onClick={() => {
                          setSelectedStudentId(std.id);
                          setCurrentView('student-activity-log');
                        }}
                        className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 transition-all cursor-pointer"
                        title="Lihat Log Aktiviti Murid"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>

                      {/* QR PORTFOLIO */}
                      <button
                        onClick={() => setQrModalStudent(std)}
                        className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-all cursor-pointer"
                        title="Kod QR Portfolio"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* FULL PROFILE */}
                      <button
                        onClick={() => onOpenStudentProfile(std)}
                        className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 transition-all cursor-pointer"
                        title="Buka Profil Lengkap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* QUICK ASSESS */}
                      <button
                        onClick={() => {
                          setSelectedStudentId(std.id);
                          setCurrentView('quick-assess');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Taksir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            Tiada murid ditemui untuk "{searchQuery}". Sila cuba kata kunci atau tapisan lain.
          </div>
        )}
      </div>

      {/* Export PBD PDF Modal */}
      <ExportPBDPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        defaultClassId={selectedClassId}
      />
    </div>
  );
};
