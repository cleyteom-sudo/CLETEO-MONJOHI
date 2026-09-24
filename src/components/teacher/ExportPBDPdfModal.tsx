import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Printer,
  Download,
  School,
  CheckCircle2,
  X,
  Award,
  ShieldCheck,
  Calendar,
  User,
  Users,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { generatePbdPdf } from '../../utils/pbdPdfGenerator';

export const ExportPBDPdfModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
}> = ({ isOpen, onClose, defaultClassId }) => {
  const { classes, selectedClassId, students, teacherProfile, guruBesarName, updateGuruBesarName, showToast } = useApp();

  const [activeClassId, setActiveClassId] = useState<string>(
    defaultClassId || selectedClassId || classes[0]?.id || ''
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isEditingGbName, setIsEditingGbName] = useState(false);
  const [tempGbName, setTempGbName] = useState(guruBesarName);

  if (!isOpen) return null;

  const currentClass =
    classes.find((c) => c.id === activeClassId) ||
    classes[0] || {
      id: 'default-class',
      name: '4 BESTARI',
      year: 4,
      academicYear: '2026/2027',
      studentCount: students.length,
      averageTP: {
        reading: 4.0,
        writing: 3.6,
        listening: 4.2,
        speaking: 3.4,
        overall: 3.8,
      },
    };

  // Resilient student filtering
  const matchingStudents = students.filter(
    (s) => s.className?.trim().toLowerCase() === currentClass.name?.trim().toLowerCase()
  );
  const classStudents = matchingStudents.length > 0 ? matchingStudents : students;

  // Compute statistics
  const tpCounts: Record<string, number> = {
    TP1: 0,
    TP2: 0,
    TP3: 0,
    TP4: 0,
    TP5: 0,
    TP6: 0,
  };

  classStudents.forEach((s) => {
    const tp = (s.overallTP || 'TP3').toUpperCase();
    if (tpCounts[tp] !== undefined) {
      tpCounts[tp]++;
    } else {
      tpCounts['TP3']++;
    }
  });

  const totalPupils = classStudents.length;
  const mtmCount =
    (tpCounts['TP3'] || 0) +
    (tpCounts['TP4'] || 0) +
    (tpCounts['TP5'] || 0) +
    (tpCounts['TP6'] || 0);
  const mtmPercentage = totalPupils > 0 ? ((mtmCount / totalPupils) * 100).toFixed(1) : '100';

  // DIRECT PDF DOWNLOAD HANDLER
  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      const result = generatePbdPdf({
        currentClass,
        students: classStudents,
        teacherProfile,
        guruBesarName,
      });

      if (result.success) {
        showToast(
          'PDF PBD Berjaya Dimuat Turun',
          `Fail ${result.filename} telah dijana dan dimuat turun.`,
          'success'
        );
      } else {
        showToast(
          'Ralat Menjana PDF',
          'Sila cuba sekali lagi atau muat turun format CSV.',
          'warning'
        );
      }
    } catch (err) {
      console.error('PDF download error:', err);
      showToast(
        'Ralat Menjana PDF',
        'Tidak dapat menghasilkan fail PDF. Sila guna eksport CSV.',
        'warning'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintPDF = () => {
    showToast(
      'Menyediakan Dokumen PBD (PDF)',
      'Menjana fail PDF rasmi A4 untuk dicetak atau disimpan...',
      'info'
    );

    // Always immediately trigger the high-fidelity vector A4 PDF download
    handleDownloadPDF();

    // Also attempt native window.print() if supported by browser/frame
    try {
      if (typeof window !== 'undefined') {
        window.print();
      }
    } catch (e) {
      console.warn('Native window.print() blocked by iframe sandbox, PDF downloaded successfully:', e);
    }
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Bil',
      'Nama Murid',
      'ID Murid',
      'Kelas',
      'Tahun',
      'Mendengar',
      'Bertutur',
      'Membaca',
      'Menulis',
      'Tahap Keseluruhan (TP)',
      'Status Pengesahan Guru',
      'Catatan Intervensi',
    ];

    const rows = classStudents.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.className}"`,
      s.year,
      s.listeningTP,
      s.speakingTP,
      s.readingTP,
      s.writingTP,
      s.overallTP,
      s.readingValidated && s.writingValidated && s.speakingValidated ? 'Disahkan' : 'Dalam Semakan',
      `"${s.interventionSkill ? `Intervensi: ${s.interventionSkill}` : 'Mencapai Standard'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `REKOD_PBD_${currentClass.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      'PBD CSV Downloaded',
      `Saved PBD record for class ${currentClass.name}`,
      'success'
    );
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[calc(100vh-1rem)] sm:max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Rekod & Laporan Rasmi PBD (PDF / Cetak)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Format KPM / idMe
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dokumen rekod transit dan pelaporan pentaksiran bilik darjah untuk simpanan guru & sekolah.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Class Selector */}
            <select
              value={activeClassId}
              onChange={(e) => setActiveClassId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-cyan-400 outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Kelas: {c.name} ({c.academicYear})
                </option>
              ))}
            </select>

            {/* Direct PDF Download Action (PRIMARY) */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? 'MENJANA PDF...' : 'MUAT TURUN PDF (PBD)'}</span>
            </button>

            {/* Print / System Dialog */}
            <button
              type="button"
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
              title="Cetak atau Pratonton Cetakan"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            {/* CSV Export */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700"
              title="Muat Turun Fail CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Eksport CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Guru Besar Quick Name Banner & Inline Editor */}
        <div className="print:hidden px-5 py-3 bg-amber-950/40 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-amber-200 font-bold">Guru Besar / Pengetua:</span>
            {!isEditingGbName ? (
              <span className="font-extrabold text-white bg-amber-900/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
                {guruBesarName}
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempGbName}
                  onChange={(e) => setTempGbName(e.target.value)}
                  placeholder="Nama Guru Besar"
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-400 text-white text-xs font-semibold focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = tempGbName.trim();
                    if (trimmed) {
                      updateGuruBesarName(trimmed);
                      setIsEditingGbName(false);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-sm"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempGbName(guruBesarName);
                    setIsEditingGbName(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          {!isEditingGbName && (
            <button
              type="button"
              onClick={() => {
                setTempGbName(guruBesarName);
                setIsEditingGbName(true);
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-100 underline cursor-pointer"
            >
              <span>Tukar Nama Guru Besar Pada Laporan PDF</span>
            </button>
          )}
        </div>

        {/* Printable Official Document Sheet */}
        <div className="p-4 sm:p-10 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0 flex-1 min-h-0">
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              KEMENTERIAN PENDIDIKAN MALAYSIA
            </div>
            <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 mt-1 tracking-tight">
              BORANG PELAPORAN PENTAKSIRAN BILIK DARJAH (PBD)
            </h1>
            <div className="text-xs font-extrabold uppercase text-slate-700 mt-0.5">
              MATA PELAJARAN: BAHASA INGGERIS (CEFR-ALIGNED)
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs border-b border-slate-300">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Sekolah</span>
              <span className="font-extrabold text-slate-900">{teacherProfile.school}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Kelas & Tahun</span>
              <span className="font-extrabold text-slate-900">
                {currentClass.name} (Tahun {currentClass.year})
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Guru Mata Pelajaran</span>
              <span className="font-extrabold text-slate-900">{teacherProfile.name}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Sesi Persekolahan</span>
              <span className="font-extrabold text-slate-900">{currentClass.academicYear}</span>
            </div>
          </div>

          {/* Student Table */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-wider border-b border-slate-300">
                  <th className="p-2 border border-slate-300 text-center w-8">Bil</th>
                  <th className="p-2 border border-slate-300">Nama Murid</th>
                  <th className="p-2 border border-slate-300 text-center w-16">Mendengar (Listening)</th>
                  <th className="p-2 border border-slate-300 text-center w-16">Bertutur (Speaking)</th>
                  <th className="p-2 border border-slate-300 text-center w-16">Membaca (Reading)</th>
                  <th className="p-2 border border-slate-300 text-center w-16">Menulis (Writing)</th>
                  <th className="p-2 border border-slate-300 text-center w-20 bg-slate-200">
                    Tahap Keseluruhan (TP)
                  </th>
                  <th className="p-2 border border-slate-300 text-center w-24">Status Guru</th>
                  <th className="p-2 border border-slate-300">Catatan Intervensi / Ulasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {classStudents.map((std, idx) => (
                  <tr key={std.id} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 text-center font-mono text-slate-600">
                      {idx + 1}
                    </td>
                    <td className="p-2 border border-slate-300 font-bold text-slate-900">
                      <div>{std.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono">{std.email}</div>
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-bold">{std.listeningTP}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold">{std.speakingTP}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold">{std.readingTP}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold">{std.writingTP}</td>
                    <td className="p-2 border border-slate-300 text-center font-black bg-slate-100 text-blue-900">
                      {std.overallTP}
                    </td>
                    <td className="p-2 border border-slate-300 text-center text-[10px]">
                      {std.readingValidated && std.writingValidated && std.speakingValidated ? (
                        <span className="font-bold text-emerald-700">Disahkan</span>
                      ) : (
                        <span className="text-amber-700 font-semibold">Separa Disahkan</span>
                      )}
                    </td>
                    <td className="p-2 border border-slate-300 text-[10px] text-slate-600">
                      {std.interventionSkill ? (
                        <span className="text-red-700 font-bold">
                          Fokus Intervensi: {std.interventionSkill}
                        </span>
                      ) : (
                        'Mencapai Standard Kandungan'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Class Mastery Statistics Summary */}
          <div className="mt-6 p-4 rounded-xl border border-slate-300 bg-slate-50">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
              Rumusan Tahap Penguasaan Kelas ({currentClass.name})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              {(['TP1', 'TP2', 'TP3', 'TP4', 'TP5', 'TP6'] as const).map((level) => {
                const count = tpCounts[level] || 0;
                const pct = totalPupils > 0 ? ((count / totalPupils) * 100).toFixed(0) : '0';
                return (
                  <div key={level} className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500">{level}</div>
                    <div className="text-sm font-black text-slate-900">{count} orang</div>
                    <div className="text-[9px] text-slate-500 font-medium">({pct}%)</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-700 font-bold pt-2 border-t border-slate-200">
              <span>Mencapai Tahap Minimum (MTM: TP3 - TP6):</span>
              <span className="text-emerald-700 font-black">
                {mtmCount} / {totalPupils} Murid ({mtmPercentage}%)
              </span>
            </div>
          </div>

          {/* Official Signatures Section */}
          <div className="mt-10 pt-6 grid grid-cols-2 gap-8 text-xs border-t border-slate-300">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-12">
                Disediakan Oleh (Guru Mata Pelajaran):
              </span>
              <div className="border-b border-slate-800 w-48 mb-1" />
              <div className="font-bold text-slate-900">{teacherProfile.name}</div>
              <div className="text-[10px] text-slate-500">Guru Bahasa Inggeris {currentClass.name}</div>
              <div className="text-[10px] text-slate-500">
                Tarikh: {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-12">
                Disahkan Oleh (Guru Besar / Penolong Kanan):
              </span>
              <div className="border-b border-slate-800 w-48 mb-1" />
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{guruBesarName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTempGbName(guruBesarName);
                    setIsEditingGbName(true);
                  }}
                  className="print:hidden text-[10px] text-amber-700 hover:text-amber-800 underline font-semibold cursor-pointer"
                >
                  (Tukar Nama)
                </button>
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">
                Guru Besar, {teacherProfile.school || 'Kementerian Pendidikan Malaysia'}
              </div>
              <div className="text-[10px] text-slate-500">
                Tarikh: {new Date().toLocaleDateString('ms-MY')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
