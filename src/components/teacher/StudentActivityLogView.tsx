import React, { useState, useMemo } from 'react';
import {
  Activity,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  BookOpen,
  Mic,
  PenTool,
  Headphones,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
  Award,
  Zap,
  Printer,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityLog, SkillType } from '../../types';

export const StudentActivityLogView: React.FC = () => {
  const {
    activityLogs,
    students,
    classes,
    setSelectedStudentId,
    setCurrentView,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Filtered & Sorted Logs
  const filteredLogs = useMemo(() => {
    return activityLogs
      .filter((log) => {
        // Keyword Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchStudent = (log.studentName || '').toLowerCase().includes(q);
          const matchTitle = (log.title || '').toLowerCase().includes(q);
          const matchDetails = (log.details || '').toLowerCase().includes(q);
          const matchSkill = (log.skill || '').toLowerCase().includes(q);
          if (!matchStudent && !matchTitle && !matchDetails && !matchSkill) {
            return false;
          }
        }

        // Student Filter
        if (selectedStudentFilter !== 'all' && log.studentId !== selectedStudentFilter) {
          return false;
        }

        // Class Filter (find pupil's class)
        if (selectedClassFilter !== 'all' && log.studentId) {
          const pupil = students.find((s) => s.id === log.studentId);
          if (!pupil || pupil.className !== selectedClassFilter) {
            return false;
          }
        }

        // Skill Filter
        if (selectedSkillFilter !== 'all') {
          if (log.skill !== selectedSkillFilter && !log.title.includes(selectedSkillFilter)) {
            return false;
          }
        }

        // Type Filter
        if (selectedTypeFilter !== 'all') {
          if (log.actionType !== selectedTypeFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // If oldest, reverse order
        return sortOrder === 'newest' ? 0 : -1;
      });
  }, [
    activityLogs,
    searchQuery,
    selectedStudentFilter,
    selectedClassFilter,
    selectedSkillFilter,
    selectedTypeFilter,
    sortOrder,
    students,
  ]);

  // Metrics
  const totalActivities = activityLogs.length;
  const speakingActivities = activityLogs.filter(
    (l) => l.actionType === 'speaking_practice' || (l.skill === 'Speaking' && l.actorRole === 'student')
  ).length;
  const readingActivities = activityLogs.filter(
    (l) => l.actionType === 'reading_quiz' || (l.skill === 'Reading' && l.actorRole === 'student')
  ).length;
  const writingActivities = activityLogs.filter(
    (l) => l.actionType === 'writing_submission' || l.actionType === 'drawing_created' || (l.skill === 'Writing' && l.actorRole === 'student')
  ).length;

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      showToast('Tiada Data', 'Tiada log aktiviti untuk dieksport.', 'info');
      return;
    }

    const headers = ['ID', 'Nama Murid', 'Kemahiran', 'Jenis Aktiviti', 'Tajuk', 'Butiran', 'Tarikh & Masa', 'Perubahan XP'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.studentName || 'Sistem'}"`,
      `"${l.skill || '-'}"`,
      `"${l.actionType}"`,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.timestamp}"`,
      l.xpChange || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smarttrack_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Log Dieksport', 'Log aktiviti murid berjaya dimuat turun dalam format CSV.', 'success');
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'speaking_practice':
        return { label: 'Pertuturan Milo', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'reading_quiz':
        return { label: 'Kefahaman Membaca', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'writing_submission':
        return { label: 'Penulisan Karangan', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'drawing_created':
        return { label: 'Lukisan Visual', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      case 'teacher_validation':
        return { label: 'Pengesahan PBD', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'badge_unlocked':
        return { label: 'Lencana Dibuka', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'level_increase':
        return { label: 'Kenaikan Tahap', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'Aktiviti Pembelajaran', bg: 'bg-slate-700/50 text-slate-300 border-slate-600/40' };
    }
  };

  const getSkillIcon = (skill?: string) => {
    switch (skill) {
      case 'Speaking':
        return <Mic className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Reading':
        return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 'Writing':
        return <PenTool className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Listening':
        return <Headphones className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Activity className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Pengauditan & Rekod Pembelajaran Murid
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Log Aktiviti Murid (Student Activity Log)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Setiap aktiviti murid dirakam secara automatik dalam sistem — pertuturan dengan Milo, latihan membaca, penulisan karangan, pengesahan guru dan lencana yang diperoleh.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Eksport CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Jumlah Log</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalActivities}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Semua aktiviti direkod</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Pertuturan Milo</span>
            <Mic className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{speakingActivities}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Latihan suara murid</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Latihan Membaca</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{readingActivities}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Kuiz & cerita selesai</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Karya & Penulisan</span>
            <PenTool className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400">{writingActivities}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Penulisan & lukisan murid</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari murid, kemahiran, atau aktiviti..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Student Filter */}
          <div>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">Semua Murid</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.className})
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} (Tahun {c.year})
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div>
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">Semua Kemahiran</option>
              <option value="Reading">Reading (Membaca)</option>
              <option value="Writing">Writing (Menulis)</option>
              <option value="Listening">Listening (Mendengar)</option>
              <option value="Speaking">Speaking (Bertutur)</option>
              <option value="General">Umum / Keseluruhan</option>
            </select>
          </div>
        </div>

        {/* Second Row: Sort & Type Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-[11px]">Jenis Aktiviti:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'speaking_practice', label: 'Pertuturan' },
                { id: 'reading_quiz', label: 'Membaca' },
                { id: 'writing_submission', label: 'Penulisan' },
                { id: 'teacher_validation', label: 'PBD Guru' },
                { id: 'badge_unlocked', label: 'Lencana' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedTypeFilter(btn.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedTypeFilter === btn.id
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sortOrder === 'newest' ? 'Terkini Dahulu' : 'Terawal Dahulu'}</span>
          </button>
        </div>
      </div>

      {/* Activity Logs Stream */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Tiada Log Aktiviti Ditemui</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tiada rekod aktiviti yang sepadan dengan carian atau tapisan yang dipilih.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = getActionBadge(log.actionType);
            const pupil = students.find((s) => s.id === log.studentId || s.name === log.studentName);

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-md transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                {/* Left Pupil & Activity Info */}
                <div className="flex items-start gap-3.5">
                  {/* Avatar / Role Icon */}
                  <div className="shrink-0 relative">
                    {pupil ? (
                      <img
                        src={pupil.avatarUrl}
                        alt={pupil.name}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-700"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                    )}
                    {/* Tiny skill badge */}
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-slate-700 shadow">
                      {getSkillIcon(log.skill)}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        {log.studentName || 'Sistem / Guru'}
                      </span>
                      {pupil && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {pupil.className} • Tahun {pupil.year}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                      {log.skill && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-800/40">
                          {log.skill}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-200">{log.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{log.details}</p>

                    {/* Result / Score or TP change tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {log.score && (
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Skor: {log.score}
                        </span>
                      )}
                      {log.xpChange && (
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>+{log.xpChange} XP</span>
                        </span>
                      )}
                      {log.tpChange && (
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {log.tpChange.skill}: {log.tpChange.from} → {log.tpChange.to}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Meta & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{log.timestamp}</span>
                  </div>

                  {pupil && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedStudentId(pupil.id);
                          setCurrentView('parent-summary');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                        title="Cetak Slip PBD Ibu Bapa"
                      >
                        <Printer className="w-3 h-3 text-cyan-400" />
                        <span>Slip PBD</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStudentId(pupil.id);
                          setCurrentView('student-list');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                        title="Lihat Profil Murid"
                      >
                        <User className="w-3 h-3 text-blue-400" />
                        <span>Profil</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
