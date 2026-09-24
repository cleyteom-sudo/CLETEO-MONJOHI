import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  Plus,
  Upload,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  Download,
  Check,
  FileCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, ClassGroup } from '../../types';
import { NewStudentEnrollmentsSection } from './NewStudentEnrollmentsSection';
import {
  parseStudentSpreadsheet,
  parseStudentTextTable,
  ParsedSpreadsheetResult,
} from '../../utils/spreadsheetStudentParser';

export const ClassManagement: React.FC = () => {
  const {
    classes,
    createClass,
    updateClass,
    deleteClass,
    importStudents,
    selectedClassId,
    setSelectedClassId,
    students,
    setCurrentView,
    showToast,
    classEnrollmentAlerts,
    resolveEnrollmentAlert,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'classes' | 'enrollments'>('classes');
  const pendingApprovalsCount = students.filter(
    (s) =>
      Boolean(s.pendingClassApproval) ||
      !classes.some((c) => c.name.trim().toUpperCase() === s.className.trim().toUpperCase())
  ).length;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTab, setImportTab] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');

  // Edit / Rename Class State
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editYear, setEditYear] = useState(4);
  const [editAcademicYear, setEditAcademicYear] = useState('2026/2027');

  // Remove Class State
  const [deletingClass, setDeletingClass] = useState<ClassGroup | null>(null);
  const [deleteMode, setDeleteMode] = useState<'reassign' | 'purge'>('reassign');
  const [reassignTargetId, setReassignTargetId] = useState<string>('');

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newYear, setNewYear] = useState(4);
  const [newAcademicYear, setNewAcademicYear] = useState('2026/2027');

  // Import State
  const [selectedTargetClass, setSelectedTargetClass] = useState('3 INOVATIF');
  const [detectedYear, setDetectedYear] = useState<number>(3);
  const [previewStudents, setPreviewStudents] = useState<Partial<Student>[]>([]);
  const [importFileName, setImportFileName] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<ParsedSpreadsheetResult | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers for Edit and Delete
  const handleOpenEdit = (cls: ClassGroup) => {
    setEditingClass(cls);
    setEditClassName(cls.name);
    setEditYear(cls.year);
    setEditAcademicYear(cls.academicYear);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassName.trim()) return;
    updateClass(editingClass.id, {
      name: editClassName.trim(),
      year: editYear,
      academicYear: editAcademicYear.trim() || '2026/2027',
    });
    setEditingClass(null);
  };

  const handleOpenDelete = (cls: ClassGroup) => {
    setDeletingClass(cls);
    const otherClasses = classes.filter((c) => c.id !== cls.id);
    setReassignTargetId(otherClasses[0]?.id || '');
    setDeleteMode('reassign');
  };

  const handleDeleteConfirm = () => {
    if (!deletingClass) return;
    if (deleteMode === 'reassign' && reassignTargetId) {
      deleteClass(deletingClass.id, reassignTargetId);
    } else {
      deleteClass(deletingClass.id);
    }
    setDeletingClass(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    createClass(newClassName.trim(), newYear, newAcademicYear);
    setNewClassName('');
    setShowCreateModal(false);
  };

  // Real Spreadsheet Processing with auto-detection of Name, Email, Year, and Class
  const handleProcessFile = async (file: File) => {
    if (!file) return;
    setIsParsing(true);
    setImportFileName(file.name);

    try {
      const result = await parseStudentSpreadsheet(file, classes);
      setParsedResult(result);

      if (result.success && result.students.length > 0) {
        setPreviewStudents(result.students);
        setSelectedTargetClass(result.primaryDetectedClass);
        setDetectedYear(result.primaryDetectedYear);

        showToast(
          'Spreadsheet Berjaya Dikesan!',
          `Mengesan ${result.students.length} orang murid. Tahun ${result.primaryDetectedYear} disegerakkan dengan kelas "${result.primaryDetectedClass}".`,
          'success'
        );
      } else {
        showToast(
          'Tiada Murid Sah Ditemui',
          result.warnings[0] || 'Sila pastikan spreadsheet mengandungi lajur Nama, Tahun dan Kelas.',
          'warning'
        );
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      showToast(
        'Ralat Memproses Fail',
        'Gagal mengekstrak data daripada fail. Sila cuba fail .xlsx atau .csv lain.',
        'warning'
      );
    } finally {
      setIsParsing(false);
      // Reset input value so selecting the same file again triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // 1-Click Quick Demo for "3 Inovatif" (Matches user request specifically)
  const handleLoadDemo3Inovatif = () => {
    const sample3Inovatif: Partial<Student>[] = [
      { name: 'NUR AISYAH BINTI AZMAN', email: 'm-10293847@moe-dl.edu.my', year: 3, className: '3 INOVATIF', readingTP: 'TP3', writingTP: 'TP3', listeningTP: 'TP3', speakingTP: 'TP3' },
      { name: 'MUHAMMAD HARITH BIN KAMAL', email: 'm-10293848@moe-dl.edu.my', year: 3, className: '3 INOVATIF', readingTP: 'TP4', writingTP: 'TP3', listeningTP: 'TP4', speakingTP: 'TP4' },
      { name: 'CHLOE TAN JIA XIN', email: 'm-10293849@moe-dl.edu.my', year: 3, className: '3 INOVATIF', readingTP: 'TP4', writingTP: 'TP4', listeningTP: 'TP4', speakingTP: 'TP4' },
      { name: 'PRAVEEN A/L SUBRAMANIAM', email: 'm-10293850@moe-dl.edu.my', year: 3, className: '3 INOVATIF', readingTP: 'TP2', writingTP: 'TP2', listeningTP: 'TP3', speakingTP: 'TP2' },
      { name: 'DANISH HAKIM BIN ROSLAN', email: 'm-10293851@moe-dl.edu.my', year: 3, className: '3 INOVATIF', readingTP: 'TP3', writingTP: 'TP2', listeningTP: 'TP3', speakingTP: 'TP3' },
      { name: 'SITI NURHALIZA BINTI YUSOF', email: 'm-10293852@moe-dl.edu.my', year: 3, className: '3 INOVATIF', readingTP: 'TP3', writingTP: 'TP3', listeningTP: 'TP3', speakingTP: 'TP3' },
      { name: 'RYAN WONG JUN WEI', email: 'm-10293853@moe-dl.edu.my', year: 3, className: '3 INOVATIF', readingTP: 'TP5', writingTP: 'TP4', listeningTP: 'TP5', speakingTP: 'TP4' },
      { name: 'ANIS SOFEA BINTI MOHD RIZAL', email: 'm-10293854@moe-dl.edu.my', year: 3, className: '3 INOVATIF', readingTP: 'TP3', writingTP: 'TP3', listeningTP: 'TP3', speakingTP: 'TP3' },
    ];

    setImportFileName('SENARAI_MURID_3_INOVATIF_2026.xlsx');
    setPreviewStudents(sample3Inovatif);
    setSelectedTargetClass('3 INOVATIF');
    setDetectedYear(3);
    setParsedResult({
      success: true,
      fileName: 'SENARAI_MURID_3_INOVATIF_2026.xlsx',
      sheetNames: ['3 INOVATIF'],
      activeSheetName: '3 INOVATIF',
      totalRowsFound: sample3Inovatif.length,
      students: sample3Inovatif as any,
      detectedClasses: [
        {
          className: '3 INOVATIF',
          year: 3,
          studentCount: sample3Inovatif.length,
          isExisting: classes.some((c) => c.name.toLowerCase() === '3 inovatif'),
        },
      ],
      primaryDetectedClass: '3 INOVATIF',
      primaryDetectedYear: 3,
      detectedColumns: {
        nameCol: 'Nama Murid',
        emailCol: 'ID DELIMa',
        yearCol: 'Tahun (3)',
        classCol: 'Kelas (3 Inovatif)',
      },
      warnings: [],
    });

    showToast(
      'Sampel 3 Inovatif Dimuatkan',
      'Auto-detect: 8 murid Tahun 3 disegerakkan dengan kelas "3 INOVATIF".',
      'success'
    );
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent =
      'BIL,NAMA MURID,ID DELIMa,TAHUN,KELAS\n' +
      '1,NUR AISYAH BINTI AZMAN,m-10293847@moe-dl.edu.my,3,3 Inovatif\n' +
      '2,MUHAMMAD HARITH BIN KAMAL,m-10293848@moe-dl.edu.my,3,3 Inovatif\n' +
      '3,CHLOE TAN JIA XIN,m-10293849@moe-dl.edu.my,3,3 Inovatif\n' +
      '4,PRAVEEN A/L SUBRAMANIAM,m-10293850@moe-dl.edu.my,3,3 Inovatif\n' +
      '5,DANISH HAKIM BIN ROSLAN,m-10293851@moe-dl.edu.my,3,3 Inovatif\n' +
      '6,SITI NURHALIZA BINTI YUSOF,m-10293852@moe-dl.edu.my,3,3 Inovatif\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Templat_Import_Murid_PBD_3_Inovatif.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Templat Dimuat Turun', 'Fail Templat_Import_Murid_PBD_3_Inovatif.csv sedia untuk diisi.', 'info');
  };

  const handleProcessPastedText = () => {
    if (!pasteText.trim()) {
      showToast('Teks Kosong', 'Sila tampal teks atau jadual dari spreadsheet anda.', 'warning');
      return;
    }
    const result = parseStudentTextTable(pasteText, classes);
    setParsedResult(result);
    if (result.success && result.students.length > 0) {
      setPreviewStudents(result.students);
      setSelectedTargetClass(result.primaryDetectedClass);
      setDetectedYear(result.primaryDetectedYear);
      showToast(
        'Teks Berjaya Dikesan!',
        `Mengesan ${result.students.length} orang murid. Tahun ${result.primaryDetectedYear} disegerakkan dengan kelas "${result.primaryDetectedClass}".`,
        'success'
      );
    } else {
      showToast(
        'Tiada Murid Dikesan',
        'Sila pastikan data mengandungi lajur nama murid.',
        'warning'
      );
    }
  };

  const handleExecuteImport = () => {
    if (previewStudents.length === 0) {
      showToast('Tiada Murid Untuk Diimport', 'Sila pilih fail spreadsheet terlebih dahulu.', 'warning');
      return;
    }

    // Check if target class exists, create it automatically if not
    const classExists = classes.some(
      (c) => c.name.toLowerCase().trim() === selectedTargetClass.toLowerCase().trim()
    );
    if (!classExists) {
      createClass(selectedTargetClass, detectedYear, '2026/2027');
    }

    importStudents(previewStudents, selectedTargetClass);
    showToast(
      'Import Murid Berjaya!',
      `Berjaya mengimport ${previewStudents.length} orang murid ke dalam kelas "${selectedTargetClass}" (Tahun ${detectedYear}).`,
      'success'
    );
    setShowImportModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Class Management & Enrollment
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Organize primary English classes and batch import student rosters from Excel or CSV files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE CLASS</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>IMPORT STUDENTS (.XLSX / .CSV)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs: Senarai Kelas vs Enrolmen Murid Baharu */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Senarai Kelas ({classes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('enrollments')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'enrollments'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Enrolmen Murid Baharu & Kelulusan Guru</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                {pendingApprovalsCount} Tindakan Diperlukan
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'enrollments' ? (
        <NewStudentEnrollmentsSection />
      ) : (
        <>
          {/* Quick Notice banner if pending enrollments exist */}
          {pendingApprovalsCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    Terdapat {pendingApprovalsCount} pendaftaran murid baharu / permohonan kelas yang menunggu tindakan guru.
                  </div>
                  <div className="text-xs text-slate-400">
                    Sahkan murid dalam kelas sedia ada, tukar kelas bagi murid tersilap pilih, atau cipta kelas baharu.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('enrollments')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
              >
                Semak & Luluskan Sekarang ({pendingApprovalsCount}) →
              </button>
            </div>
          )}

          {/* Pending DELIMa Enrollment Alerts for Missing Classes */}
      {classEnrollmentAlerts && classEnrollmentAlerts.filter((a) => a.status === 'pending').length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <span>
                  Pemberitahuan Pendaftaran Murid DELIMa: Kelas Belum Wujud (
                  {classEnrollmentAlerts.filter((a) => a.status === 'pending').length})
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tindakan Diperlukan
                </span>
              </h4>
              <p className="text-xs text-slate-300">
                Murid berikut mendaftar melalui DELIMa dengan kelas yang belum wujud. Klik butang "Cipta Kelas & Sahkan" untuk mendaftarkan kelas baharu dan enrol murid secara automatik.
              </p>
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
                      title="Abaikan"
                    >
                      Abaikan
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => s.className === cls.name);
          const count = classStudents.length || cls.studentCount;
          const isSelected = selectedClassId === cls.id;

          return (
            <div
              key={cls.id}
              className={`p-6 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-md ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500 shadow-2xl shadow-blue-500/15'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Year {cls.year}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1.5">{cls.name}</h3>
                  <p className="text-xs text-slate-400">Academic Year {cls.academicYear}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 text-blue-400 border border-slate-700/60">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800/80 mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Enrolled</span>
                  <div className="text-lg font-black text-white">{count} Pupils</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Class Average</span>
                  <div className="text-lg font-black text-cyan-300">
                    TP {cls.averageTP.overall.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Skills summary pills */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] mb-4">
                <div className="p-1.5 rounded-lg bg-slate-800/80">
                  <div className="text-slate-400">R</div>
                  <div className="font-bold text-white">TP{cls.averageTP.reading.toFixed(1)}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-800/80">
                  <div className="text-slate-400">W</div>
                  <div className="font-bold text-white">TP{cls.averageTP.writing.toFixed(1)}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-800/80">
                  <div className="text-slate-400">L</div>
                  <div className="font-bold text-white">TP{cls.averageTP.listening.toFixed(1)}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-800/80">
                  <div className="text-slate-400">S</div>
                  <div className="font-bold text-white">TP{cls.averageTP.speaking.toFixed(1)}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setCurrentView('student-list');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition-colors"
                  >
                    View Student Roster
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setCurrentView('quick-assess');
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                  >
                    Assess
                  </button>
                </div>

                {/* Manage Class Row: Edit / Rename & Single Remove Button */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cls)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-400" />
                    <span>Rename / Edit Class</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(cls)}
                    className="py-2 px-3.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-800/50 hover:border-rose-700"
                    title="Remove Class"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Remove Class</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

      {/* EDIT & RENAME CLASS MODAL */}
      {editingClass && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Edit & Rename Class</h3>
                <p className="text-xs text-slate-400">Update class name, year level, or academic session</p>
              </div>
            </div>

            <div className="my-3 p-3 rounded-xl bg-blue-950/30 border border-blue-800/50 text-xs text-blue-200">
              <span className="font-bold text-cyan-300">Sync Notice:</span> Renaming this class will automatically sync the class name for all enrolled students, portfolio artifacts, and PBD intervention records.
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Class Name (e.g. 4 BESTARI, 5 HARMONI)
                </label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  placeholder="e.g. 4 BESTARI"
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year Level</label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value={4}>Year 4</option>
                    <option value={5}>Year 5</option>
                    <option value={6}>Year 6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={editAcademicYear}
                    onChange={(e) => setEditAcademicYear(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Rename Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* REMOVE CLASS MODAL */}
      {deletingClass && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Remove Class</h3>
                <p className="text-xs text-slate-400">{deletingClass.name} • Year {deletingClass.year}</p>
              </div>
            </div>

            {classes.length <= 1 ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-amber-300 mb-1">Cannot Remove Only Class</strong>
                    <span>You must keep at least one active class in English AI SmartTrack. Create another class first if you wish to remove this one.</span>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingClass(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Are you sure you want to remove <strong className="text-white">{deletingClass.name}</strong>?
                  {(() => {
                    const enrolledCount = students.filter((s) => s.className === deletingClass.name).length;
                    return enrolledCount > 0 ? (
                      <span> There are currently <strong className="text-cyan-300">{enrolledCount} enrolled pupils</strong> in this class.</span>
                    ) : null;
                  })()}
                </p>

                {(() => {
                  const enrolledCount = students.filter((s) => s.className === deletingClass.name).length;
                  const otherClasses = classes.filter((c) => c.id !== deletingClass.id);

                  if (enrolledCount === 0) return null;

                  return (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-slate-300">Student Handling:</div>
                      <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="deleteMode"
                          checked={deleteMode === 'reassign'}
                          onChange={() => setDeleteMode('reassign')}
                          className="mt-0.5 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-semibold block text-white">Reassign {enrolledCount} pupils to another class</span>
                          <span className="text-slate-400 text-[11px]">Pupil progress, evidence, and TP levels will be preserved.</span>
                        </div>
                      </label>

                      {deleteMode === 'reassign' && (
                        <div className="ml-5 mt-2">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Class:</label>
                          <select
                            value={reassignTargetId}
                            onChange={(e) => setReassignTargetId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                          >
                            {otherClasses.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} (Year {c.year})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer pt-2 border-t border-slate-800/80">
                        <input
                          type="radio"
                          name="deleteMode"
                          checked={deleteMode === 'purge'}
                          onChange={() => setDeleteMode('purge')}
                          className="mt-0.5 text-rose-600 focus:ring-rose-500"
                        />
                        <div>
                          <span className="font-semibold block text-rose-300">Remove class and enrolled pupil records</span>
                          <span className="text-slate-400 text-[11px]">Permanently removes the class and associated pupil profiles.</span>
                        </div>
                      </label>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDeletingClass(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Remove Class</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* CREATE CLASS MODAL */}
      {showCreateModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white mb-1">Create New Class</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new Malaysian primary school English group.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Class Name (e.g. 4 DEDIKASI, 5 CEMERLANG)
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. 4 DEDIKASI"
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                  <select
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={4}>Year 4</option>
                    <option value={5}>Year 5</option>
                    <option value={6}>Year 6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* IMPORT STUDENT LIST MODAL (Prompt Requirement #9 & Auto-detect Year/Class) */}
      {showImportModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-7 shadow-2xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>IMPORT SENARAI MURID (EXCEL / CSV)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Auto-Detect PBD
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sistem mengekstrak Nama, E-mel DELIMa, Tahun & menyelaraskan Kelas (contoh: Tahun 3 ⟷ Kelas 3 Inovatif).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto pr-1 py-4 space-y-4 flex-1 min-h-0">
              {/* Quick Actions Bar (Template & 1-Click Demo) */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Format disokong: <strong>.xlsx, .xls, .csv</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors cursor-pointer"
                    title="Muat turun fail templat Excel/CSV contoh"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Muat Turun Templat</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadDemo3Inovatif}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                    title="Uji dengan sampel Kelas 3 Inovatif serta-merta"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Uji Sampel 3 Inovatif</span>
                  </button>
                </div>
              </div>

              {/* Input Mode Tabs: File Upload vs Direct Text Paste */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setImportTab('upload')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    importTab === 'upload'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Muat Naik Fail (.xlsx, .csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab('paste')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    importTab === 'paste'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tampal Jadual / Teks (Copy-Paste)</span>
                </button>
              </div>

              {/* TAB 1: File Upload */}
              {importTab === 'upload' && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative p-6 rounded-2xl border-2 border-dashed text-center transition-all ${
                    dragActive
                      ? 'border-emerald-400 bg-emerald-950/20 scale-[0.99]'
                      : isParsing
                      ? 'border-cyan-500 bg-slate-950/90'
                      : 'border-slate-700 hover:border-emerald-500/70 bg-slate-950/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                    onChange={handleFileUpload}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden"
                  />

                  {isParsing ? (
                    <div className="py-4 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                      <div className="text-xs font-bold text-cyan-300">
                        Membaca fail spreadsheet & menganalisis lajur...
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Mengekstrak nama murid, e-mel, dan menyegerakkan tahun & kelas...
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
                      <div>
                        <div className="text-xs font-bold text-white mb-0.5">
                          Pilih fail spreadsheet rasmi sekolah (APDM / SPS / Excel / CSV)
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Sistem akan mengekstrak Nama, Tahun & Kelas secara automatik (contoh: 3 Inovatif).
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>PILIH FAIL DARI KOMPUTER</span>
                        </button>
                        <span className="text-xs text-slate-500">atau heret fail ke kotak ini</span>
                      </div>

                      {importFileName && (
                        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-xs font-mono text-emerald-300">
                          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Fail Diproses: <strong>{importFileName}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Direct Text Paste */}
              {importTab === 'paste' && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      Tampal lajur terus daripada Excel, Google Sheets atau fail teks:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Format disokong: Tab-delimited atau Comma-separated (CSV)
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={`Contoh data disalin dari Excel:
BIL	NAMA MURID	ID DELIMA	TAHUN	KELAS
1	NUR AISYAH BINTI AZMAN	m-10293847@moe-dl.edu.my	3	3 INOVATIF
2	MUHAMMAD HARITH BIN KAMAL	m-10293848@moe-dl.edu.my	3	3 INOVATIF
3	CHLOE TAN JIA XIN	m-10293849@moe-dl.edu.my	3	3 INOVATIF`}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPasteText('')}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Kosongkan Teks
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessPastedText}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Analisis Teks & Kesan Murid</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Auto-Detection & Class/Year Sync Confirmation Banner */}
              {previewStudents.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs text-emerald-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Dikesan: Kelas "{selectedTargetClass}" • Tahun {detectedYear}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ Tahun & Kelas Diselaraskan
                    </span>
                  </div>

                  <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                    Sistem telah menyegerakkan semua <strong>{previewStudents.length} orang murid Tahun {detectedYear}</strong> dengan kelas <strong>"{selectedTargetClass}"</strong> secara automatik.
                    {!classes.some((c) => c.name.toLowerCase() === selectedTargetClass.toLowerCase()) && (
                      <span className="block mt-1 text-amber-300 font-bold">
                        ✨ Kelas "{selectedTargetClass}" akan dicipta secara automatik ke dalam senarai kelas anda semasa proses import.
                      </span>
                    )}
                  </p>

                  {/* Auto-detected columns breakdown */}
                  {parsedResult?.detectedColumns && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-900/60 text-[10px]">
                      <div className="bg-slate-900/70 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block font-semibold">Lajur Nama:</span>
                        <span className="text-emerald-400 font-bold truncate block">✓ {parsedResult.detectedColumns.nameCol || 'Dikesan'}</span>
                      </div>
                      <div className="bg-slate-900/70 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block font-semibold">E-mel DELIMa:</span>
                        <span className="text-emerald-400 font-bold truncate block">✓ {parsedResult.detectedColumns.emailCol || 'Auto DELIMa'}</span>
                      </div>
                      <div className="bg-slate-900/70 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block font-semibold">Tahun Persekolahan:</span>
                        <span className="text-cyan-400 font-bold truncate block">✓ Tahun {detectedYear}</span>
                      </div>
                      <div className="bg-slate-900/70 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block font-semibold">Nama Kelas:</span>
                        <span className="text-indigo-300 font-bold truncate block">✓ {selectedTargetClass}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Target Class Selection Dropdown */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Penetapan Kelas Sasaran (Target Class):
                  </label>
                  <span className="text-[11px] text-cyan-400 font-medium">
                    Tahun {detectedYear}
                  </span>
                </div>
                <select
                  value={selectedTargetClass}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setSelectedTargetClass(chosen);
                    // Extract year from chosen class name if possible
                    const m = chosen.match(/([1-6])/);
                    if (m) {
                      setDetectedYear(parseInt(m[1], 10));
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {/* If detected class is new, showcase it at top */}
                  {!classes.some((c) => c.name.toLowerCase() === selectedTargetClass.toLowerCase()) && (
                    <option value={selectedTargetClass}>
                      ✨ {selectedTargetClass} (Tahun {detectedYear} - Dikesan Baharu, Auto-Cipta)
                    </option>
                  )}
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Tahun {c.year} • {c.studentCount} Murid sedia ada)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Anda boleh membiarkan kelas auto-dikesan di atas atau memilih kelas lain yang sedia ada.
                </p>
              </div>

              {/* PBD Axiom Alert: AI SUGGESTION — TEACHER VALIDATION REQUIRED */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block font-bold mb-0.5">
                    PRINSIP ASAS PBD: CADANGAN BASELINE AI PERLU DISAHKAN OLEH GURU
                  </strong>
                  <span>
                    Setiap murid baharu akan diberi cadangan baseline TP3 sementara. Tahap Penguasaan (TP) rasmi KPM hanya akan dimuktamadkan selepas guru membuat pentaksiran berasaskan evidens bilik darjah.
                  </span>
                </div>
              </div>

              {/* Data Preview Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-300">
                    Pratonton Data Murid ({previewStudents.length} Murid Dijumpai)
                  </span>
                  {previewStudents.length > 0 && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{previewStudents.length} Sedia Untuk Diimport</span>
                    </span>
                  )}
                </div>

                {previewStudents.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 text-xs">
                    <p className="font-semibold text-slate-300 mb-1">Belum Ada Fail Dipilih</p>
                    <p>Sila pilih fail spreadsheet Excel / CSV anda atau klik "Uji Sampel 3 Inovatif" di atas.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 max-h-60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5">No</th>
                          <th className="p-2.5">Nama Murid</th>
                          <th className="p-2.5">ID DELIMa</th>
                          <th className="p-2.5">Tahun & Kelas</th>
                          <th className="p-2.5">Cadangan TP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {previewStudents.map((std, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="p-2.5 text-slate-400">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-white whitespace-nowrap">{std.name}</td>
                            <td className="p-2.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">{std.email}</td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                                {std.className || selectedTargetClass} (Thn {std.year || detectedYear})
                              </span>
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {std.readingTP || 'TP3'} (Cadangan AI)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPreviewStudents([]);
                  setImportFileName('');
                  setParsedResult(null);
                }}
                disabled={previewStudents.length === 0}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              >
                Kosongkan
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={previewStudents.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    IMPORT {previewStudents.length} MURID KE {selectedTargetClass}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
