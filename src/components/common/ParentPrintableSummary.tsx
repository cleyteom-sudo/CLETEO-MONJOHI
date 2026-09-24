import React, { useState, useEffect } from 'react';
import {
  Printer,
  ArrowLeft,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  Mic,
  PenTool,
  Headphones,
  School,
  Heart,
  Calendar,
  User,
  Info,
  ExternalLink,
  ChevronDown,
  Download,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, SkillType } from '../../types';
import { getDskpForYear } from '../../data/dskpData';
import { generateParentSlipPdf } from '../../utils/parentSlipPdfGenerator';

interface ParentPrintableSummaryProps {
  customStudentId?: string | null;
  onBack?: () => void;
  isPublicQrMode?: boolean;
}

export const ParentPrintableSummary: React.FC<ParentPrintableSummaryProps> = ({
  customStudentId,
  onBack,
  isPublicQrMode = false,
}) => {
  const {
    students,
    selectedStudent,
    setSelectedStudentId,
    teacherProfile,
    guruBesarName,
    setCurrentView,
    evidenceList,
    showToast,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Find target student
  const activeStudentId = customStudentId || selectedStudent?.id || students[0]?.id;
  const currentStudent: Student =
    students.find((s) => s.id === activeStudentId) ||
    selectedStudent ||
    students[0];

  const studentYear = currentStudent?.year || 4;
  const dskpCurriculum = getDskpForYear(studentYear);

  const studentEvidences = evidenceList.filter(
    (e) => e.studentId === currentStudent?.id || e.studentName === currentStudent?.name
  );

  const currentDateFormatted = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const shareableUrl = `${window.location.origin}${window.location.pathname}?qr=1&studentId=${encodeURIComponent(
    currentStudent?.id || ''
  )}&view=parent-summary`;

  const handleDownloadPdf = () => {
    if (!currentStudent) return;
    setIsGeneratingPdf(true);
    showToast(
      'Menjana Slip PBD (PDF)',
      `Menjana fail PDF rasmi A4 untuk ${currentStudent.name}...`,
      'info'
    );

    try {
      const result = generateParentSlipPdf({
        student: currentStudent,
        teacherProfile,
        guruBesarName,
      });

      if (result.success) {
        showToast(
          'Slip PBD Berjaya Dimuat Turun',
          `Fail ${result.filename} sedia untuk dicetak atau dihantar kepada ibu bapa.`,
          'success'
        );
      } else {
        showToast(
          'Ralat Menjana PDF',
          'Sila cuba sekali lagi atau guna cetakan pelayar.',
          'warning'
        );
      }
    } catch (err) {
      console.error('Error in handleDownloadPdf:', err);
      showToast('Ralat Menjana PDF', 'Sila cuba sekali lagi.', 'warning');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    showToast(
      'Menyediakan Slip PBD (PDF)',
      'Menjana fail PDF rasmi A4 untuk dicetak atau disimpan...',
      'info'
    );

    // Always immediately trigger the high-fidelity vector A4 PDF download
    handleDownloadPdf();

    // Also attempt native window.print() if supported by browser/frame
    try {
      if (typeof window !== 'undefined') {
        window.print();
      }
    } catch (err) {
      console.warn('Native window.print() blocked by iframe sandbox, PDF downloaded successfully:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(shareableUrl);
    setCopied(true);
    showToast('Pautan Disalin', 'Pautan slip ringkasan PBD ibu bapa disalin ke papan keratan.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  // Helper to describe TP in parent-friendly Malay & English
  const getTPDescription = (skill: SkillType, tp: string) => {
    const descriptions: Record<string, { en: string; bm: string }> = {
      TP1: {
        en: 'Can recognize basic words and simple cues with extensive guidance.',
        bm: 'Boleh mengenal perkataan asas dan isyarat mudah dengan bimbingan penuh guru.',
      },
      TP2: {
        en: 'Understands and produces simple routine words, phrases, and short questions.',
        bm: 'Memahami dan menghasilkan frasa mudah, soalan ringkas dan perkataan lazim.',
      },
      TP3: {
        en: 'Understands main ideas, communicates satisfactorily in familiar classroom contexts.',
        bm: 'Memahami idea utama dan berinteraksi secara memuaskan dalam situasi harian bilik darjah.',
      },
      TP4: {
        en: 'Good mastery. Communicates clearly, understands detail, and applies skills independently.',
        bm: 'Penguasaan baik. Berkomunikasi dengan jelas, memahami butiran terperinci dan berdikari.',
      },
      TP5: {
        en: 'Commendable mastery. Expresses ideas fluently with confident vocabulary and grammar.',
        bm: 'Penguasaan sangat baik. Menyatakan idea dengan fasih berserta tatabahasa dan kosa kata mantap.',
      },
      TP6: {
        en: 'Exemplary mastery. Outstanding fluency, creative expression, and role model for peers.',
        bm: 'Penguasaan cemerlang. Menunjukkan kefasihan tinggi, daya fikir kreatif dan menjadi teladan.',
      },
    };
    return descriptions[tp] || descriptions.TP3;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-3 sm:px-6 lg:px-8 print:p-0 print:bg-white print:text-black">
      {/* Non-Printable Top Navigation & Control Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md print:hidden">
        <div className="flex items-center gap-2">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Kembali</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('student-list')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Senarai Murid</span>
            </button>
          )}

          <div>
            <h1 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Slip Ringkasan Rekod PBD Ibu Bapa</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                A4 Printable
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Format rasmi Kementerian Pendidikan Malaysia untuk cetakan dan simpanan ibu bapa.
            </p>
          </div>
        </div>

        {/* Pupil Selector (if teacher / multi-student view) */}
        {!isPublicQrMode && students.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Pilih Murid:</span>
            <select
              value={currentStudent?.id}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.className} • {s.overallTP})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons: Download PDF, Print & Copy Link */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            title="Salin pautan terus untuk ibu bapa"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copied ? 'Disalin! ✓' : 'Salin Pautan'}</span>
          </button>

          {/* 1-Click Direct Official PDF Download */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all cursor-pointer whitespace-nowrap"
            title="Muat turun fail PDF rasmi A4 untuk simpanan / perkongsian WhatsApp"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingPdf ? 'MENJANA PDF...' : 'MUAT TURUN PDF (A4)'}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-extrabold shadow-lg shadow-blue-500/25 transition-all cursor-pointer whitespace-nowrap"
            title="Buka dialog cetakan sistem / pelayar"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>CETAK / PRINT</span>
          </button>
        </div>
      </div>

      {/* Non-Printable Helpful Tip Notice */}
      <div className="max-w-4xl mx-auto mb-5 p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 flex items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Panduan Guru & Ibu Bapa:</strong> Klik <strong>MUAT TURUN PDF (A4)</strong> untuk fail PDF rasmi berkualiti tinggi yang siap disimpan atau dihantar melalui WhatsApp / Telegram.
          </span>
        </div>
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="text-cyan-300 hover:text-white underline text-[11px] font-bold whitespace-nowrap cursor-pointer"
        >
          Muat Turun Sekarang →
        </button>
      </div>

      {/* ============================================================== */}
      {/* OFFICIAL PRINTABLE PBD DOCUMENT SHEET (A4 Standard Compliant) */}
      {/* ============================================================== */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:max-w-none print:rounded-none">
        
        {/* Document Header with Logos & Ministry Title */}
        <div className="border-b-2 border-slate-900 pb-5 mb-5">
          <div className="flex items-center justify-between gap-4">
            {/* School Crest / KPM Logo Area */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-900 via-indigo-800 to-cyan-600 flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-slate-900">
                <School className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900 block">
                  KEMENTERIAN PENDIDIKAN MALAYSIA
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                  SEKOLAH KEBANGSAAN SERI BINTANG BESTARI
                </h2>
                <p className="text-[11px] text-slate-600 font-medium">
                  Jalan Bintang Bestari, 55100 Kuala Lumpur • Kod Sekolah: WBA0045 • Tel: 03-92841234
                </p>
              </div>
            </div>

            {/* Document Title Badge */}
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg bg-blue-900 text-white font-extrabold text-[11px] uppercase tracking-wider mb-1">
                SLIP PELAPORAN PBD
              </span>
              <div className="text-xs font-black text-slate-900">BAHASA INGGERIS (ENGLISH)</div>
              <div className="text-[11px] text-slate-600 font-semibold">SESI AKADEMIK 2026/2027</div>
            </div>
          </div>
        </div>

        {/* Student Particulars Table */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Nama Murid / Pupil Name:
            </span>
            <strong className="text-slate-950 text-sm font-extrabold">{currentStudent.name}</strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tahun & Kelas / Class:
            </span>
            <strong className="text-slate-900 font-bold">
              {currentStudent.className} (Tahun {currentStudent.year})
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              ID DELIMa Murid:
            </span>
            <span className="font-mono text-slate-800 font-semibold">{currentStudent.email}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tarikh Cetakan / Date:
            </span>
            <span className="text-slate-800 font-semibold">{currentDateFormatted}</span>
          </div>
        </div>

        {/* Overall TP Highlight Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md print:bg-blue-900 print:text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                Tahap Penguasaan Keseluruhan (Overall Mastery Level)
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              {currentStudent.overallTP} • {dskpCurriculum.cefrLevel} (CEFR Standard)
            </h3>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Murid dinilai secara holistik dan berterusan berdasarkan Dokumen Standard Kurikulum dan Pentaksiran (DSKP) Bahasa Inggeris KSSR Semakan.
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0 bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
            <span className="text-[10px] uppercase font-bold text-cyan-200 block">Status Pengesahan</span>
            <span className="font-extrabold text-sm text-white flex items-center gap-1.5 justify-center sm:justify-end">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>DISAHKAN GURU</span>
            </span>
            <span className="text-[10px] text-blue-200 block mt-0.5">{teacherProfile.name}</span>
          </div>
        </div>

        {/* 4 Skills Competency Table */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Pelaporan Mengikut 4 Kemahiran Bahasa Inggeris (Skills Breakdown)
            </h4>
            <span className="text-[10px] font-bold text-slate-500">
              DSKP Tahun {studentYear} Standard
            </span>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-extrabold uppercase text-[10px] border-b border-slate-300">
                <tr>
                  <th className="p-3 w-32">Kemahiran (Skill)</th>
                  <th className="p-3 w-20 text-center">Tahap (TP)</th>
                  <th className="p-3">Huraian Standard DSKP & Pencapaian Murid</th>
                  <th className="p-3 w-28 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  {
                    skill: 'Listening' as SkillType,
                    labelBM: 'Kemahiran Mendengar',
                    tp: currentStudent.listeningTP,
                    icon: Headphones,
                    validated: currentStudent.listeningValidated,
                  },
                  {
                    skill: 'Speaking' as SkillType,
                    labelBM: 'Kemahiran Bertutur',
                    tp: currentStudent.speakingTP,
                    icon: Mic,
                    validated: currentStudent.speakingValidated,
                  },
                  {
                    skill: 'Reading' as SkillType,
                    labelBM: 'Kemahiran Membaca',
                    tp: currentStudent.readingTP,
                    icon: BookOpen,
                    validated: currentStudent.readingValidated,
                  },
                  {
                    skill: 'Writing' as SkillType,
                    labelBM: 'Kemahiran Menulis',
                    tp: currentStudent.writingTP,
                    icon: PenTool,
                    validated: currentStudent.writingValidated,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const desc = getTPDescription(item.skill, item.tp);

                  return (
                    <tr key={item.skill} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 align-top">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-blue-700 shrink-0" />
                          <div>
                            <span className="block font-extrabold">{item.skill}</span>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              {item.labelBM}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-center align-top">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-blue-100 text-blue-950 font-black text-xs border border-blue-300">
                          {item.tp}
                        </span>
                      </td>

                      <td className="p-3 text-slate-700 align-top leading-relaxed">
                        <div className="font-semibold text-slate-900">{desc.en}</div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">{desc.bm}</div>
                      </td>

                      <td className="p-3 text-center align-top">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Disahkan</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher's Qualitative Assessment & Notes */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-1.5 text-blue-900 font-black text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Ulasan Perkembangan & Sikap Pembelajaran Murid oleh Guru:</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-serif italic">
            "{currentStudent.name} menunjukkan komitmen dan perkembangan positif sepanjang sesi persekolahan. Murid aktif menyertai aktiviti pertuturan dan latihan berpandu di dalam kelas serta menggunakan platform pintar ini untuk membina keyakinan bertutur dalam Bahasa Inggeris. Teruskan usaha cemerlang ini di rumah bersama ibu bapa!"
          </p>
          <div className="mt-2 text-[11px] text-slate-600 font-semibold flex items-center justify-between">
            <span>Disediakan oleh: <strong>{teacherProfile.name}</strong> (Guru Bahasa Inggeris)</span>
            <span>Kehadiran & Konsistensi: <strong>{currentStudent.streakDays} Hari Berturut-turut</strong></span>
          </div>
        </div>

        {/* Guidance for Parents at Home */}
        <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-4 mb-6 text-xs text-slate-800">
          <h5 className="font-black text-blue-950 uppercase text-[11px] mb-1 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-700" />
            <span>Cadangan Sokongan Ibu Bapa di Rumah (Home Learning Tips):</span>
          </h5>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
            <li>Luangkan 10-15 minit sehari membaca buku cerita dwibahasa atau berbahasa Inggeris bersama anak.</li>
            <li>Beri sokongan untuk anak berbual santai menggunakan aplikasi Milo Speaking Buddy bagi memantapkan sebutan.</li>
            <li>Puji setiap usaha dan peningkatan tahap penguasaan (TP) bagi membina keyakinan diri mereka.</li>
          </ul>
        </div>

        {/* Official Signatures Block & Parent Acknowledgement Slip */}
        <div className="border-t-2 border-slate-900 pt-5 mt-6">
          <div className="grid grid-cols-2 gap-8 text-xs mb-8">
            {/* Teacher Signature */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-8">
                Tandatangan Guru Matapelajaran:
              </span>
              <div className="border-b border-slate-400 pb-1 font-bold text-slate-950">
                ({teacherProfile.name.toUpperCase()})
              </div>
              <span className="text-[10px] text-slate-500 block">Guru Bahasa Inggeris</span>
              <span className="text-[10px] text-slate-500 block">{teacherProfile.school}</span>
            </div>

            {/* Guru Besar Signature */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-8">
                Disahkan oleh Guru Besar / Pengetua:
              </span>
              <div className="border-b border-slate-400 pb-1 font-bold text-slate-950">
                ({guruBesarName.toUpperCase()})
              </div>
              <span className="text-[10px] text-slate-500 block">Guru Besar</span>
              <span className="text-[10px] text-slate-500 block">SK Seri Bintang Bestari</span>
            </div>
          </div>

          {/* Dotted Tear-Off Parent Acknowledgement Slip */}
          <div className="border-t border-dashed border-slate-400 pt-4 text-[11px] text-slate-600">
            <div className="text-center font-bold uppercase text-[10px] tracking-wider text-slate-500 mb-2">
              ✂ KERATAN AKUAN TERIMA IBU BAPA / PENJAGA (Sila kembalikan kepada guru kelas jika dicetak)
            </div>
            <p className="leading-relaxed">
              Saya, .................................................................... (Ibu / Bapa / Penjaga kepada <strong>{currentStudent.name}</strong>, Kelas <strong>{currentStudent.className}</strong>) telah meneliti dan menerima Slip Pelaporan Pentaksiran Bilik Darjah (PBD) Bahasa Inggeris ini.
            </p>
            <div className="grid grid-cols-2 gap-8 mt-6">
              <div>
                <span className="text-[10px] text-slate-500 block mb-6">Tandatangan Ibu Bapa / Penjaga:</span>
                <div className="border-b border-slate-400 w-48"></div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-6">Tarikh:</span>
                <div className="border-b border-slate-400 w-32"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 print:text-slate-500">
          Dijana secara automatik melalui English AI SmartTrack PBD System • Diiktiraf untuk rekod PBD Sekolah Rendah KPM
        </div>
      </div>
    </div>
  );
};
