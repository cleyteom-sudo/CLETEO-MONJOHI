import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  School,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { ExportPBDPdfModal } from './ExportPBDPdfModal';
import { generatePbdPdf } from '../../utils/pbdPdfGenerator';

export const ReportsAndAnalytics: React.FC = () => {
  const { classes, selectedClassId, students, teacherProfile, guruBesarName, updateGuruBesarName, showToast } = useApp();
  const [reportType, setReportType] = useState<'class-summary' | 'individual' | 'intervention'>('class-summary');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isEditingGbName, setIsEditingGbName] = useState(false);
  const [tempGbName, setTempGbName] = useState(guruBesarName);

  const currentClass =
    classes.find((c) => c.id === selectedClassId) ||
    classes[0] || {
      id: 'default-class',
      name: '4 BESTARI',
      year: 4,
      academicYear: '2026/2027',
      studentCount: students.length,
      averageTP: { reading: 4.0, writing: 3.6, listening: 4.2, speaking: 3.4, overall: 3.8 },
    };

  const matchingStudents = students.filter(
    (s) => s.className?.trim().toLowerCase() === currentClass.name?.trim().toLowerCase()
  );
  const classStudents = matchingStudents.length > 0 ? matchingStudents : students;
  const targetStudent = students.find((s) => s.id === selectedStudentId) || classStudents[0] || students[0];

  const handleDirectDownloadPdf = () => {
    try {
      const result = generatePbdPdf({
        currentClass,
        students: classStudents,
        teacherProfile,
        guruBesarName,
      });
      if (result.success) {
        showToast(
          'PDF PBD Dimuat Turun',
          `Fail ${result.filename} telah dimuat turun.`,
          'success'
        );
      } else {
        setIsPdfModalOpen(true);
      }
    } catch {
      setIsPdfModalOpen(true);
    }
  };

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = [
      'No',
      'Student Name',
      'Class',
      'Year',
      'Reading TP',
      'Writing TP',
      'Listening TP',
      'Speaking TP',
      'Overall TP',
      'Teacher Validated',
      'Assessment Date',
    ];
    const rows = classStudents.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      `"${s.className}"`,
      s.year,
      s.readingTP,
      s.writingTP,
      s.listeningTP,
      s.speakingTP,
      s.overallTP,
      s.readingValidated && s.writingValidated && s.speakingValidated ? 'YES' : 'PARTIAL',
      '2026-09-18',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PBD_EXPORT_${currentClass.name.replace(' ', '_')}_idMe.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('idMe Export Generated', `Successfully downloaded CSV formatted for idMe reference.`, 'success');
  };

  const handlePrint = () => {
    showToast(
      'Menyediakan Dokumen PBD (PDF)',
      'Menjana fail PDF rasmi A4 untuk dicetak atau disimpan...',
      'info'
    );
    // Always trigger PDF generation immediately
    handleDirectDownloadPdf();
    try {
      if (typeof window !== 'undefined') {
        window.print();
      }
    } catch (e) {
      console.warn('Native window.print() blocked by iframe sandbox, PDF downloaded successfully:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Analytics, Reports & idMe Export
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              MOE Compatibility
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Compile formal classroom assessments, generate print-ready summaries, and export data matching Malaysian Ministry of Education standards.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Direct 1-Click PDF Download */}
          <button
            type="button"
            onClick={handleDirectDownloadPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            title="Muat Turun Fail PDF Rasmi PBD Sekarang"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD PDF (PBD)</span>
          </button>

          {/* Open Full PBD Sheet Modal */}
          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>LIHAT / CETAK BORANG PBD</span>
          </button>

          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>EKSPORT idMe (CSV)</span>
          </button>
        </div>
      </div>

      {/* idMe / MOE COMPATIBILITY DISCLAIMER (Prompt Requirement #39) */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/60 text-xs text-blue-200 flex items-start gap-3">
        <School className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-cyan-300 font-bold block mb-1">
            Official Ministry of Education (MOE) Compliance Disclaimer:
          </strong>
          <span>
            “Generated reports and data exports serve as structured classroom assessment records to assist teachers in offline documentation and data preparation for official MOE entry (e.g. idMe / Sistem Pengurusan Pentaksiran Bersepadu). SmartTrack does not replace official MOE authorization.”
          </span>
        </div>
      </div>

      {/* Class Level Competency Graphs & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TP Distribution */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
            Tahap Penguasaan (TP) Distribution — {currentClass.name}
          </h3>

          <div className="space-y-3">
            {[
              { level: 'TP6 (Exemplary)', count: 3, pct: 10, color: 'bg-emerald-400' },
              { level: 'TP5 (Very Good)', count: 7, pct: 22, color: 'bg-teal-400' },
              { level: 'TP4 (Good)', count: 12, pct: 38, color: 'bg-blue-500' },
              { level: 'TP3 (Satisfactory)', count: 7, pct: 22, color: 'bg-indigo-500' },
              { level: 'TP2 (Limited)', count: 3, pct: 10, color: 'bg-amber-500', alert: true },
              { level: 'TP1 (Very Limited)', count: 0, pct: 0, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.level} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${item.alert ? 'text-amber-400' : 'text-slate-300'}`}>
                    {item.level}
                  </span>
                  <span className="font-mono text-slate-400">
                    {item.count} pupils ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Minimum Curriculum Target: <strong>TP3 (CEFR A1)</strong></span>
            <span className="text-emerald-400 font-bold">90% Achieved TP3 or higher</span>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Monthly PBD Average Trend
            </h3>

            <div className="space-y-4">
              {[
                { month: 'April 2026', avg: 'TP 3.1', note: 'Diagnostic Baseline' },
                { month: 'May 2026', avg: 'TP 3.3', note: 'Mid-term Formative' },
                { month: 'June 2026', avg: 'TP 3.5', note: 'Unit 3 Reading checkpoint' },
                { month: 'July 2026', avg: 'TP 3.7', note: 'Targeted Interventions Started' },
                { month: 'August 2026', avg: 'TP 3.9', note: 'Current Progress' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <div className="font-bold text-white">{item.month}</div>
                    <div className="text-[10px] text-slate-400">{item.note}</div>
                  </div>
                  <span className="font-black text-cyan-300 font-mono text-sm">{item.avg}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold">
            +0.8 TP improvement across the cohort since baseline.
          </div>
        </div>
      </div>

      {/* Report Generator Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-black text-white">REPORT GENERATOR</h3>
            <p className="text-xs text-slate-400">
              Select preview type to print or export formal documentation.
            </p>
          </div>

          {/* Quick Guru Besar Name Editor for Generator & Reports */}
          <div className="flex items-center gap-2 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs">
            <span className="text-amber-200 font-bold hidden sm:inline">Guru Besar:</span>
            {!isEditingGbName ? (
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs">{guruBesarName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTempGbName(guruBesarName);
                    setIsEditingGbName(true);
                  }}
                  className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] cursor-pointer"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempGbName}
                  onChange={(e) => setTempGbName(e.target.value)}
                  placeholder="Nama Guru Besar"
                  className="px-2 py-0.5 rounded bg-slate-950 border border-amber-400 text-white text-xs font-semibold focus:outline-none"
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
                  className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] cursor-pointer"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempGbName(guruBesarName);
                    setIsEditingGbName(false);
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setReportType('class-summary')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  reportType === 'class-summary' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Class Summary
              </button>
              <button
                onClick={() => setReportType('individual')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  reportType === 'individual' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Individual Pupil Report
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Cetak Pratonton Laporan PBD"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {/* Report Preview Canvas */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white text-slate-900 shadow-2xl print:shadow-none print:p-0">
          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600">
              KEMENTERIAN PENDIDIKAN MALAYSIA
            </h4>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              PENTAKSIRAN BILIK DARJAH (PBD) — ENGLISH LANGUAGE
            </h3>
            <p className="text-xs text-slate-600">
              SK SERI BINTANG BESTARI • ACADEMIC SESSION 2026/2027
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Class: {currentClass.name} | Year: {currentClass.year} | Date: {new Date().toLocaleDateString()}
            </p>
          </div>

          {reportType === 'class-summary' ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300 text-[10px]">
                    <tr>
                      <th className="p-2 border-r border-slate-300">No</th>
                      <th className="p-2 border-r border-slate-300">Pupil Name</th>
                      <th className="p-2 border-r border-slate-300 text-center">Reading</th>
                      <th className="p-2 border-r border-slate-300 text-center">Writing</th>
                      <th className="p-2 border-r border-slate-300 text-center">Listening</th>
                      <th className="p-2 border-r border-slate-300 text-center">Speaking</th>
                      <th className="p-2 border-r border-slate-300 text-center">Overall TP</th>
                      <th className="p-2">Teacher Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {classStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-200 font-mono text-center">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-bold">{s.name}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-semibold">{s.readingTP}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-semibold">{s.writingTP}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-semibold">{s.listeningTP}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-semibold">{s.speakingTP}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-black bg-slate-100">{s.overallTP}</td>
                        <td className="p-2 text-[10px] text-emerald-700 font-bold">
                          {s.readingValidated && s.speakingValidated ? 'VALIDATED' : 'PARTIALLY VALIDATED'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-300 flex justify-between text-xs text-slate-600">
                <div>
                  <p>Certified by Subject Teacher:</p>
                  <div className="mt-8 border-b border-slate-400 w-48" />
                  <p className="mt-1 font-bold">{(teacherProfile.name || 'Cikgu Sarah binti Ahmad').toUpperCase()}</p>
                  <p className="text-[10px]">Guru Bahasa Inggeris {currentClass.name}</p>
                </div>
                <div>
                  <p>Verified by Guru Besar / PK Pentadbiran:</p>
                  <div className="mt-8 border-b border-slate-400 w-48" />
                  <p className="mt-1 font-bold">{guruBesarName.toUpperCase()}</p>
                  <p className="text-[10px]">Guru Besar, {teacherProfile.school || 'SK Seri Bintang Bestari'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h5 className="font-extrabold text-sm">{targetStudent.name}</h5>
                  <p className="text-xs text-slate-500">{targetStudent.email} • {targetStudent.className}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Overall Tahap Penguasaan</span>
                  <div className="text-2xl font-black text-blue-700">{targetStudent.overallTP}</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Reading</div>
                  <div className="text-xl font-black text-slate-800">{targetStudent.readingTP}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Writing</div>
                  <div className="text-xl font-black text-slate-800">{targetStudent.writingTP}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Listening</div>
                  <div className="text-xl font-black text-slate-800">{targetStudent.listeningTP}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Speaking</div>
                  <div className="text-xl font-black text-slate-800">{targetStudent.speakingTP}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed">
                <strong className="block mb-1">Qualitative Assessment Statement:</strong>
                Pupil participates actively during guided oral lessons. Shows solid vocabulary retention in daily activities. With structured speaking scaffolding and Milo Buddy practice, student has advanced towards independent verbal confidence according to DSKP Year {currentClass.year} standards.
              </div>

              <div className="mt-8 pt-6 border-t border-slate-300 flex justify-between text-xs text-slate-600">
                <div>
                  <p>Certified by Subject Teacher:</p>
                  <div className="mt-8 border-b border-slate-400 w-48" />
                  <p className="mt-1 font-bold">{(teacherProfile.name || 'Cikgu Sarah binti Ahmad').toUpperCase()}</p>
                  <p className="text-[10px]">Guru Bahasa Inggeris</p>
                </div>
                <div>
                  <p>Verified by Guru Besar / PK Pentadbiran:</p>
                  <div className="mt-8 border-b border-slate-400 w-48" />
                  <p className="mt-1 font-bold">{guruBesarName.toUpperCase()}</p>
                  <p className="text-[10px]">Guru Besar, {teacherProfile.school || 'SK Seri Bintang Bestari'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export PBD as PDF Modal */}
      <ExportPBDPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        defaultClassId={selectedClassId}
      />
    </div>
  );
};
