import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  BookOpen,
  Mic,
  PenTool,
  Headphones,
  CheckCircle2,
  Sparkles,
  Target,
  ArrowUpRight,
  Filter,
  BarChart3,
  Compass,
  Layers,
  BookMarked,
} from 'lucide-react';
import { Student, SkillType } from '../../types';
import { TranslateBMButton } from '../common/TranslateBMButton';
import { getDskpForYear } from '../../data/dskpData';

interface StudentGrowthSummaryProps {
  student: Student;
}


// Map TP string ('TP1'-'TP6') to numeric value 1-6
const tpToNum = (tp: string | undefined): number => {
  if (!tp) return 3;
  const match = tp.match(/\d+/);
  return match ? parseInt(match[0], 10) : 3;
};

// Map numeric value 1-6 to TP label and descriptors
const numToTpLabel = (num: number): string => {
  const rounded = Math.round(num);
  const clamped = Math.max(1, Math.min(6, rounded));
  return `TP${clamped}`;
};

const tpDescriptions: Record<number, { level: string; label: string; labelBM: string; cefr: string }> = {
  1: { level: 'TP1', label: 'Very Limited', labelBM: 'Sangat Terhad', cefr: 'Pre-A1' },
  2: { level: 'TP2', label: 'Limited', labelBM: 'Terhad', cefr: 'Pre-A1+' },
  3: { level: 'TP3', label: 'Satisfactory', labelBM: 'Memuaskan', cefr: 'A1 Low' },
  4: { level: 'TP4', label: 'Good', labelBM: 'Baik', cefr: 'A1 Mid' },
  5: { level: 'TP5', label: 'Very Good', labelBM: 'Sangat Baik', cefr: 'A1 High' },
  6: { level: 'TP6', label: 'Excellent', labelBM: 'Cemerlang', cefr: 'A2' },
};

export const StudentGrowthSummary: React.FC<StudentGrowthSummaryProps> = ({ student }) => {
  const [chartType, setChartType] = useState<'timeline' | 'radar' | 'units'>('timeline');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<'all' | SkillType>('all');
  const [termPeriod, setTermPeriod] = useState<'term1' | 'term2' | 'cumulative'>('cumulative');

  // Baseline and target levels for this student
  const currentReading = tpToNum(student.readingTP);
  const currentWriting = tpToNum(student.writingTP);
  const currentListening = tpToNum(student.listeningTP);
  const currentSpeaking = tpToNum(student.speakingTP);
  const currentOverall = tpToNum(student.overallTP);

  // Generate realistic academic term progression data based on student's current TP
  // In Malaysian academic calendar, Term 1: March - June, Term 2: July - November
  const termTimelineData = [
    {
      month: 'March (W1)',
      period: 'term1',
      unit: 'Orientation & Diagnostic',
      reading: Math.max(1, currentReading - 1),
      writing: Math.max(1, currentWriting - 1),
      listening: Math.max(1, currentListening - 1),
      speaking: Math.max(1, currentSpeaking - 1),
      overall: Math.max(1, currentOverall - 1),
      target: 4,
    },
    {
      month: 'April (W5)',
      period: 'term1',
      unit: 'Unit 1: Where Are You From?',
      reading: Math.max(1, currentReading - 1),
      writing: Math.max(1, currentWriting - 1),
      listening: currentListening,
      speaking: Math.max(1, currentSpeaking - 1),
      overall: Math.max(1, currentOverall - 0.7),
      target: 4,
    },
    {
      month: 'May (W10)',
      period: 'term1',
      unit: 'Unit 2: Life in the Past',
      reading: currentReading,
      writing: Math.max(1, currentWriting - 0.5),
      listening: currentListening,
      speaking: Math.max(1, currentSpeaking - 0.5),
      overall: Math.max(1, currentOverall - 0.3),
      target: 4,
    },
    {
      month: 'June (W14)',
      period: 'term1',
      unit: 'Mid-Term Review & PBD 1',
      reading: currentReading,
      writing: currentWriting,
      listening: currentListening,
      speaking: currentSpeaking,
      overall: currentOverall,
      target: 4,
    },
    {
      month: 'July (W18)',
      period: 'term2',
      unit: 'Unit 3: In The Wild',
      reading: Math.min(6, currentReading + (currentReading < 4 ? 0.3 : 0)),
      writing: currentWriting,
      listening: currentListening,
      speaking: currentSpeaking,
      overall: currentOverall,
      target: 4,
    },
    {
      month: 'August (W22)',
      period: 'term2',
      unit: 'Unit 4: Celebrations (Current)',
      reading: currentReading,
      writing: currentWriting,
      listening: currentListening,
      speaking: currentSpeaking,
      overall: currentOverall,
      target: 4,
    },
  ];

  // Filter timeline by term period
  const filteredTimeline = termTimelineData.filter((item) => {
    if (termPeriod === 'term1') return item.period === 'term1';
    if (termPeriod === 'term2') return item.period === 'term2';
    return true; // cumulative
  });

  // Radar chart data: 360 degree comparison of 4 skills + Language Arts
  const radarData = [
    {
      skill: 'Reading',
      skillBM: 'Membaca',
      Baseline: Math.max(1, currentReading - 1),
      Current: currentReading,
      Target: 4,
      fullMark: 6,
    },
    {
      skill: 'Writing',
      skillBM: 'Menulis',
      Baseline: Math.max(1, currentWriting - 1),
      Current: currentWriting,
      Target: 4,
      fullMark: 6,
    },
    {
      skill: 'Listening',
      skillBM: 'Mendengar',
      Baseline: Math.max(1, currentListening - 1),
      Current: currentListening,
      Target: 5,
      fullMark: 6,
    },
    {
      skill: 'Speaking',
      skillBM: 'Bertutur',
      Baseline: Math.max(1, currentSpeaking - 1),
      Current: currentSpeaking,
      Target: 4,
      fullMark: 6,
    },
    {
      skill: 'Grammar & Arts',
      skillBM: 'Seni Bahasa',
      Baseline: Math.max(1, Math.round((currentReading + currentWriting) / 2) - 1),
      Current: Math.round((currentReading + currentWriting) / 2),
      Target: 4,
      fullMark: 6,
    },
  ];

  // Unit-by-Unit curriculum mastery data
  const unitMasteryData = [
    {
      unit: 'U1: Where From',
      fullName: 'Unit 1: Where Are You From?',
      Reading: Math.max(2, currentReading - 1),
      Writing: Math.max(2, currentWriting - 1),
      Listening: currentListening,
      Speaking: Math.max(2, currentSpeaking - 1),
    },
    {
      unit: 'U2: Life In Past',
      fullName: 'Unit 2: Life In The Past',
      Reading: currentReading,
      Writing: Math.max(2, currentWriting - 0.5),
      Listening: currentListening,
      Speaking: Math.max(2, currentSpeaking - 0.5),
    },
    {
      unit: 'U3: In The Wild',
      fullName: 'Unit 3: In The Wild',
      Reading: currentReading,
      Writing: currentWriting,
      Listening: currentListening,
      Speaking: currentSpeaking,
    },
    {
      unit: 'U4: Celebrations',
      fullName: 'Unit 4: Celebrations',
      Reading: currentReading,
      Writing: currentWriting,
      Listening: Math.min(6, currentListening + 0.2),
      Speaking: currentSpeaking,
    },
  ];

  // Skill colors mapping
  const skillColors: Record<string, { stroke: string; fill: string; dot: string; text: string }> = {
    Reading: { stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.15)', dot: '#0284c7', text: 'text-sky-400' },
    Writing: { stroke: '#c084fc', fill: 'rgba(192, 132, 252, 0.15)', dot: '#9333ea', text: 'text-purple-400' },
    Listening: { stroke: '#34d399', fill: 'rgba(52, 211, 153, 0.15)', dot: '#059669', text: 'text-emerald-400' },
    Speaking: { stroke: '#fbbf24', fill: 'rgba(251, 191, 36, 0.15)', dot: '#d97706', text: 'text-amber-400' },
    Overall: { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.15)', dot: '#e11d48', text: 'text-rose-400' },
  };

  // Calculate improvement metrics
  const startOverall = termTimelineData[0].overall;
  const growthPoints = Number((currentOverall - startOverall).toFixed(1));
  const isGrowing = growthPoints >= 0;

  // Custom Recharts Tooltip
  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl text-xs space-y-2 min-w-[190px]">
          <div className="font-extrabold text-white border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-cyan-400 font-normal">Term Growth</span>
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const val = Number(entry.value);
              const tpCode = numToTpLabel(val);
              const desc = tpDescriptions[Math.round(val)] || tpDescriptions[3];
              return (
                <div key={index} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-300 font-medium">{entry.name}:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-white">{tpCode}</span>
                    <span className="text-[10px] text-slate-400">({desc.cefr})</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 italic">
            Standard: TP1 (Very Limited) to TP6 (Exemplary)
          </div>
        </div>
      );
    }
    return null;
  };

  const studentYear = student.year || 4;
  const dskpCurriculum = getDskpForYear(studentYear);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Visual Performance Summary</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
              <BookMarked className="w-3 h-3 text-blue-400" />
              <span>DSKP Tahun {studentYear} ({dskpCurriculum.cefrLevel})</span>
            </span>
            <span className="text-xs text-slate-400">Academic Term 2026/2027</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>English Skills Growth Analytics</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs sm:text-sm text-slate-300">
              Track {student.name}'s competency progression and learning trajectory across all language components.
            </p>
            <TranslateBMButton
              englishText="Track student's competency progression and learning trajectory across all language components."
              bmTranslation="Pantau perkembangan penguasaan dan trajektori pembelajaran murid merentas semua komponen kemahiran bahasa."
              tipsBM="Carta menunjukkan peningkatan Tahap Penguasaan (TP1 - TP6) dari awal penggal persekolahan sehingga kini."
            />
          </div>
        </div>

        {/* View Switchers (Timeline, Radar, Units) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setChartType('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'timeline'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Timeline Growth</span>
            </button>
            <button
              onClick={() => setChartType('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'radar'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>360° Radar</span>
            </button>
            <button
              onClick={() => setChartType('units')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'units'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Unit Mastery</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Quick Performance Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Term Growth</span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-black text-emerald-400">+{growthPoints} TP</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400">Since Term 1 Baseline</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Highest Skill</span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-black text-cyan-300">Listening</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="font-bold text-cyan-400">{student.listeningTP}</span>
            <span>• CEFR {tpDescriptions[currentListening]?.cefr || 'A1'}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Level</span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-black text-purple-400">TP4</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] text-slate-400">Year-End KPM Standard</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confidence Pulse</span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-black text-amber-400">Rising</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-400">+3 Speaking tasks with Milo</span>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="space-y-4">
        {/* Controls bar for Timeline view */}
        {chartType === 'timeline' && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Skill Selector Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-semibold text-[11px] mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Show:</span>
              </span>
              {(['all', 'Reading', 'Writing', 'Listening', 'Speaking'] as const).map((skill) => {
                const isActive = selectedSkillFilter === skill;
                return (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkillFilter(skill)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {skill === 'all' ? 'All 4 Skills' : skill}
                  </button>
                );
              })}
            </div>

            {/* Term Period Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setTermPeriod('term1')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  termPeriod === 'term1' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Term 1
              </button>
              <button
                onClick={() => setTermPeriod('term2')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  termPeriod === 'term2' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Term 2
              </button>
              <button
                onClick={() => setTermPeriod('cumulative')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  termPeriod === 'cumulative' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Full Year
              </button>
            </div>
          </div>
        )}

        {/* 1. TIMELINE GROWTH CHART */}
        {chartType === 'timeline' && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTimeline} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWriting" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorListening" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSpeaking" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    domain={[1, 6]}
                    ticks={[1, 2, 3, 4, 5, 6]}
                    tickFormatter={(val) => `TP${val}`}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip content={<CustomTimelineTooltip />} />

                  {/* Target Benchmark Line (TP4 Standard) */}
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target Standard (TP4)"
                    stroke="#64748b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />

                  {/* Conditional render based on filter */}
                  {(selectedSkillFilter === 'all' || selectedSkillFilter === 'Reading') && (
                    <Area
                      type="monotone"
                      dataKey="reading"
                      name="Reading"
                      stroke={skillColors.Reading.stroke}
                      fill="url(#colorReading)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: skillColors.Reading.dot, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {(selectedSkillFilter === 'all' || selectedSkillFilter === 'Writing') && (
                    <Area
                      type="monotone"
                      dataKey="writing"
                      name="Writing"
                      stroke={skillColors.Writing.stroke}
                      fill="url(#colorWriting)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: skillColors.Writing.dot, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {(selectedSkillFilter === 'all' || selectedSkillFilter === 'Listening') && (
                    <Area
                      type="monotone"
                      dataKey="listening"
                      name="Listening"
                      stroke={skillColors.Listening.stroke}
                      fill="url(#colorListening)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: skillColors.Listening.dot, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {(selectedSkillFilter === 'all' || selectedSkillFilter === 'Speaking') && (
                    <Area
                      type="monotone"
                      dataKey="speaking"
                      name="Speaking"
                      stroke={skillColors.Speaking.stroke}
                      fill="url(#colorSpeaking)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: skillColors.Speaking.dot, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Interactive Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-sky-400" />
                <span className="text-slate-300 font-semibold">Reading ({student.readingTP})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-slate-300 font-semibold">Writing ({student.writingTP})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-slate-300 font-semibold">Listening ({student.listeningTP})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-slate-300 font-semibold">Speaking ({student.speakingTP})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 border-t-2 border-dashed border-slate-400" />
                <span className="text-slate-400 font-medium">TP4 Target</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. 360° RADAR COMPETENCY CHART */}
        {chartType === 'radar' && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center">
            <div className="text-center mb-2">
              <h3 className="text-sm font-bold text-white">Multi-Skill Proficiency Comparison</h3>
              <p className="text-[11px] text-slate-400">
                Comparing Baseline (Term Start) vs Current Progress vs Year-End Target
              </p>
            </div>

            <div className="h-72 w-full max-w-md">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#334155" strokeDasharray="2 2" />
                  <PolarAngleAxis dataKey="skill" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 6]}
                    tickCount={7}
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(val) => `TP${val}`}
                  />
                  {/* Baseline (Term Start) */}
                  <Radar
                    name="Term Baseline (March)"
                    dataKey="Baseline"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.25}
                  />
                  {/* Current Assessment */}
                  <Radar
                    name="Current Progress (August)"
                    dataKey="Current"
                    stroke="#38bdf8"
                    fill="#38bdf8"
                    fillOpacity={0.45}
                  />
                  {/* Target Standard */}
                  <Radar
                    name="Year Target Standard"
                    dataKey="Target"
                    stroke="#a855f7"
                    fill="transparent"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    formatter={(value) => <span className="text-slate-300">{value}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. CURRICULUM UNIT BY UNIT BAR CHART */}
        {chartType === 'units' && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-center mb-2">
              <h3 className="text-sm font-bold text-white">Performance Across SOW Curriculum Units</h3>
              <p className="text-[11px] text-slate-400">
                Tahap Penguasaan level per Scheme of Work learning theme
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitMasteryData} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="unit"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    domain={[0, 6]}
                    ticks={[1, 2, 3, 4, 5, 6]}
                    tickFormatter={(val) => `TP${val}`}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1.5">
                            <span className="font-extrabold text-white block pb-1 border-b border-slate-800">
                              {label}
                            </span>
                            {payload.map((p: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between gap-3">
                                <span className="text-slate-300 font-medium">{p.name}:</span>
                                <span className="font-bold text-white">TP{Math.round(Number(p.value))}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    formatter={(val) => <span className="text-slate-300">{val}</span>}
                  />
                  <Bar dataKey="Reading" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Writing" fill="#c084fc" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Listening" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Speaking" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Analytical Insights & Recommendations Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-950/40 to-purple-950/30 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
              <span>PBD Trajectory Analysis</span>
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                On Track for TP4 Target
              </span>
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-relaxed">
              {student.name} demonstrates strongest proficiency in <strong className="text-emerald-300">Listening ({student.listeningTP})</strong>. 
              Active participation in Speaking Buddy has boosted conversational spontaneity. Continue practicing written sentence connectors to elevate <strong className="text-purple-300">Writing ({student.writingTP})</strong> to the next level.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Overall Validated TP</div>
            <div className="text-lg font-black text-white">{student.overallTP} (CEFR {tpDescriptions[currentOverall]?.cefr})</div>
          </div>
        </div>
      </div>
    </div>
  );
};
