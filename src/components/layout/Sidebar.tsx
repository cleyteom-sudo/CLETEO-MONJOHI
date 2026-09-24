import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FolderKanban,
  BrainCircuit,
  HeartHandshake,
  BarChart3,
  FileText,
  History,
  Compass,
  TrendingUp,
  BookOpen,
  Mic,
  Headphones,
  PenTool,
  Target,
  Award,
  Sparkles,
  Palette,
  AlertTriangle,
  Lightbulb,
  Printer,
  Activity,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface NavSection {
  categoryTitle: string;
  categoryTitleBM: string;
  items: {
    id: string;
    label: string;
    labelBM: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
    badge?: string;
    count?: number;
    alert?: boolean;
  }[];
}

export const Sidebar: React.FC<{
  isOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenAuth?: () => void;
}> = ({ isOpen = false, onCloseMobile, onOpenAuth }) => {
  const {
    role,
    currentView,
    setCurrentView,
    students,
    interventions,
    weeklyMission,
    fontSize,
  } = useApp();

  const needsInterventionCount = students.filter(
    (s) => s.interventionStatus === 'Needs Intervention' || s.interventionStatus === 'In Progress'
  ).length;

  const teacherSections: NavSection[] = [
    {
      categoryTitle: 'ASSESSMENT & CLASSES',
      categoryTitleBM: 'PENTAKSIRAN & KELAS',
      items: [
        { id: 'teacher-dashboard', label: 'Main Dashboard', labelBM: 'Dashboard Utama', icon: LayoutDashboard },
        { id: 'class-management', label: 'My Classes', labelBM: 'Kelas & Murid Saya', icon: Users },
        { id: 'quick-assess', label: 'Quick Assessment', labelBM: 'Pentaksiran Pantas DSKP', icon: ClipboardCheck, highlight: true },
        { id: 'student-list', label: 'Student Roster & PBD', labelBM: 'Senarai Murid & PBD', icon: FolderKanban },
      ],
    },
    {
      categoryTitle: 'SUPPORT & EVIDENCE',
      categoryTitleBM: 'BIMBINGAN & EVIDEN',
      items: [
        {
          id: 'intervention',
          label: 'Intervention Tracker',
          labelBM: 'Penjejak Intervensi',
          icon: HeartHandshake,
          count: needsInterventionCount > 0 ? needsInterventionCount : undefined,
          alert: true,
        },
        { id: 'evidence-portfolio', label: 'Evidence Portfolio', labelBM: 'Portfolio Eviden', icon: BookOpen },
        { id: 'student-activity-log', label: 'Student Activity Log', labelBM: 'Log Aktiviti Murid', icon: Activity, badge: 'LOGS' },
        { id: 'ai-insights', label: 'AI PBD Insights', labelBM: 'Analisis Pintar AI', icon: BrainCircuit, badge: 'AI' },
      ],
    },
    {
      categoryTitle: 'REPORTS & PARENTS',
      categoryTitleBM: 'LAPORAN & IBU BAPA',
      items: [
        { id: 'parent-summary', label: 'Print Parent Slip', labelBM: 'Cetak Slip Ibu Bapa', icon: Printer, highlight: true },
        { id: 'reports', label: 'PBD Analytics & idMe', labelBM: 'Analisis & Rumusan idMe', icon: BarChart3 },
        { id: 'live-demo', label: 'Live Demo Scenario', labelBM: 'Simulasi Panduan', icon: Sparkles, badge: 'DEMO' },
      ],
    },
  ];

  const studentSections: NavSection[] = [
    {
      categoryTitle: 'MY LEARNING WORLD',
      categoryTitleBM: 'DUNIA SAYA',
      items: [
        { id: 'student-world', label: '🌍 My Learning World', labelBM: 'Laman Utama Saya', icon: Compass },
        { id: 'first-timer', label: '🌟 1st Timer Diagnostic', labelBM: 'Panduan Pengguna Baru', icon: Sparkles, badge: 'TP TEST', highlight: true },
        { id: 'task-history', label: '📜 Task History & Stars', labelBM: 'Sejarah Tugasan & Bintang', icon: History },
        { id: 'student-portfolio', label: 'My Digital Portfolio', labelBM: 'Portfolio & Lencana', icon: Award },
        { id: 'parent-summary', label: 'My Parent Report Slip', labelBM: 'Slip PBD Ibu Bapa', icon: Printer },
      ],
    },
    {
      categoryTitle: 'ENGLISH SKILLS LAB',
      categoryTitleBM: 'KEMAHIRAN BAHASA',
      items: [
        { id: 'student-speaking', label: 'Speaking Arena (Milo 🤖)', labelBM: 'Pertuturan Milo', icon: Mic, highlight: true },
        { id: 'student-reading', label: 'Reading Island', labelBM: 'Pulau Membaca', icon: BookOpen },
        { id: 'student-writing', label: 'Writing Castle & Draw', labelBM: 'Istana Menulis & Lukis', icon: PenTool },
        { id: 'student-listening', label: 'Listening Bay', labelBM: 'Teluk Mendengar', icon: Headphones },
        { id: 'live-demo', label: 'Interactive Demo', labelBM: 'Skenario Interaktif', icon: Sparkles, badge: 'DEMO' },
      ],
    },
  ];

  const sections = role === 'teacher' ? teacherSections : studentSections;

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-[61px] left-0 bottom-0 z-40 w-64 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between p-3.5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto h-[calc(100vh-61px)]`}
      >
        <div className="space-y-4">
          {/* Active Mode Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                PORTAL AKTIF
              </span>
              <h4 className="text-xs font-black text-white flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>{role === 'teacher' ? 'Portal Guru (Teacher)' : 'Portal Murid (Student)'}</span>
              </h4>
            </div>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                role === 'teacher'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {role === 'teacher' ? 'GURU' : 'MURID'}
            </span>
          </div>

          {/* Categorized Navigation Sections */}
          <div className="space-y-4">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {/* Category Header */}
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>{section.categoryTitleBM}</span>
                  <span className="text-[9px] text-slate-400 font-semibold">{section.categoryTitle}</span>
                </div>

                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left group cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                            : item.highlight
                            ? 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/40 hover:text-white border border-blue-800/40'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                              isActive
                                ? 'text-white'
                                : item.highlight
                                ? 'text-cyan-400'
                                : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <div className="truncate">
                            <span className="block truncate">{item.labelBM}</span>
                            <span className="block text-[10px] font-medium text-slate-400 truncate -mt-0.5">
                              {item.label}
                            </span>
                          </div>
                        </div>

                        {/* Badges or Counts */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          {item.badge && (
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}

                          {item.count !== undefined && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow">
                              {item.count}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Helper Card */}
        <div className="pt-3 border-t border-slate-900">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-white font-bold">
              <span>Kurikulum DSKP</span>
              <span className="text-cyan-400 text-[10px]">Tahun 1 - 6</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Sesuai untuk pentaksir kanan dan murid sekolah rendah.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
