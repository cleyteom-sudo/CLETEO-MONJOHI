import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Share2,
  Printer,
  ShieldCheck,
  Heart,
  BookOpen,
  Mic,
  PenTool,
  CheckCircle2,
  ExternalLink,
  School,
  FileText,
  Download,
  Copy,
} from 'lucide-react';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';

export const ParentQRModal: React.FC<{
  student: Student | null;
  onClose: () => void;
}> = ({ student, onClose }) => {
  const { showToast, setCurrentView, setSelectedStudentId } = useApp();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [viewAsParent, setViewAsParent] = useState(false);

  // Generate real, camera-scannable QR code
  useEffect(() => {
    if (!student) return;

    // Use current origin and path with studentId parameter
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const scanUrl = `${origin}${pathname}?qr=1&studentId=${encodeURIComponent(student.id)}&view=parent-summary`;

    QRCode.toDataURL(scanUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });
  }, [student]);

  if (!student) return null;

  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const directAccessUrl = `${origin}${pathname}?qr=1&studentId=${encodeURIComponent(student.id)}&view=parent-summary`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(directAccessUrl);
    setCopied(true);
    showToast('Pautan Disalin', 'Pautan portfolio dan slip PBD ibu bapa disalin.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenPrintSummary = () => {
    setSelectedStudentId(student.id);
    setCurrentView('parent-summary');
    onClose();
  };

  if (!student) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!viewAsParent ? (
          /* QR Code Generator Screen */
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <QrCode className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Kod QR Akses Ibu Bapa & Murid</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Imbas dengan kamera telefon pintar untuk membuka slip rasmi PBD & portfolio digital {student.name}.
              </p>
            </div>

            {/* Generated Real QR Card */}
            <div className="p-6 rounded-3xl bg-white text-slate-900 max-w-xs mx-auto shadow-2xl flex flex-col items-center border border-slate-200">
              {/* High-Resolution Real Scannable QR Code */}
              <div className="w-52 h-52 bg-white p-2 rounded-2xl border-2 border-slate-800 flex items-center justify-center relative shadow-inner">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Kod QR PBD ${student.name}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="animate-pulse flex items-center justify-center text-xs text-slate-400">
                    Menjana Kod QR...
                  </div>
                )}

                {/* Center Badge */}
                <div className="absolute inset-0 m-auto w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-[11px] shadow-md pointer-events-none ring-2 ring-white">
                  PBD
                </div>
              </div>

              <div className="mt-3 text-center">
                <div className="font-extrabold text-sm text-slate-900">{student.name}</div>
                <div className="text-[11px] text-slate-600 font-semibold">
                  {student.className} • Tahun {student.year} • Tahap {student.overallTP}
                </div>
                <div className="mt-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  SK SERI BINTANG BESTARI
                </div>
              </div>
            </div>

            {/* Quick Link Notice */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2 text-left">
              <span className="truncate font-mono text-[10px] text-slate-300">
                {directAccessUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 text-cyan-400 hover:text-cyan-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Disalin!' : 'Salin'}</span>
              </button>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {/* PRIMARY: PRINT SUMMARY FOR PARENTS */}
              <button
                onClick={handleOpenPrintSummary}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>CETAK SLIP PBD IBU BAPA</span>
              </button>

              <button
                onClick={() => setViewAsParent(true)}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>PRATONTON PAPARAN IBU BAPA</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 text-slate-400 text-[11px]">
              <span>💡 Guru boleh mencetak kad QR ini dan menampalnya pada buku latihan murid.</span>
            </div>
          </div>
        ) : (
          /* Read-only Parent Portfolio View */
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="font-black text-sm text-white">Pratonton Portal Ibu Bapa</h4>
                  <p className="text-[10px] text-slate-400">SK Seri Bintang Bestari • English PBD</p>
                </div>
              </div>
              <button
                onClick={() => setViewAsParent(false)}
                className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
              >
                ← Kembali ke Kod QR
              </button>
            </div>

            {/* Pupil Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
              />
              <div>
                <div className="font-extrabold text-sm text-white">{student.name}</div>
                <div className="text-xs text-slate-400">
                  {student.className} • Tahap Penguasaan Keseluruhan:{' '}
                  <strong className="text-cyan-300 font-extrabold">{student.overallTP}</strong>
                </div>
              </div>
            </div>

            {/* 4 Skill Badges */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Reading</span>
                <strong className="text-white font-extrabold">{student.readingTP}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Writing</span>
                <strong className="text-white font-extrabold">{student.writingTP}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Listening</span>
                <strong className="text-white font-extrabold">{student.listeningTP}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Speaking</span>
                <strong className="text-white font-extrabold">{student.speakingTP}</strong>
              </div>
            </div>

            {/* Teacher's Note to Parents */}
            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200">
              <strong className="text-cyan-300 block mb-1 flex items-center gap-1 font-bold">
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                Catatan Guru kepada Ibu Bapa:
              </strong>
              <span>
                “{student.name} menunjukkan penglibatan yang sangat positif sepanjang pembelajaran Bahasa Inggeris di dalam kelas. Teruskan bimbingan di rumah!”
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => setViewAsParent(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Kembali ke Kod QR
              </button>

              <button
                onClick={handleOpenPrintSummary}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Buka Slip Lengkap (Cetak A4)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
