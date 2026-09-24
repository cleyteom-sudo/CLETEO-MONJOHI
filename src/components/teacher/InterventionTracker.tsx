import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  HeartHandshake,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
  ShieldCheck,
  BookOpen,
  Zap,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SkillType, TPLevel } from '../../types';
import {
  getDskpForYear,
  getDskpInterventionsForYear,
  getLearningStandardsForYearAndSkill,
  getDskpTpDescriptor,
} from '../../data/dskpData';

export const InterventionTracker: React.FC = () => {
  const { interventions, updateInterventionStatus, students, classes, addIntervention, showToast } = useApp();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [skill, setSkill] = useState<SkillType>('Speaking');
  const [selectedStandardCode, setSelectedStandardCode] = useState<string>('');
  const [targetTP, setTargetTP] = useState<TPLevel>('TP3');
  const [interventionTitle, setInterventionTitle] = useState('');
  const [targetDescription, setTargetDescription] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'all'>('all');

  // Selected student
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const pupilYear = activeStudent?.year || 4;
  const dskpCurriculum = getDskpForYear(pupilYear);
  const dskpInterventions = getDskpInterventionsForYear(pupilYear, skill);
  const learningStandards = getLearningStandardsForYearAndSkill(pupilYear, skill);

  // Initialize or update fields when student or skill changes in modal
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const stu = students.find((s) => s.id === studentId);
    if (stu) {
      const yr = stu.year || 4;
      const invs = getDskpInterventionsForYear(yr, skill);
      if (invs.length > 0) {
        setInterventionTitle(`[DSKP Thn ${yr}] ${invs[0].title}`);
        setTargetTP(invs[0].targetTP);
        setTargetDescription(`${invs[0].description} • Aktiviti: ${invs[0].activities.join(', ')}`);
        setSelectedStandardCode(invs[0].learningStandardCode);
      }
    }
  };

  const handleSelectSkill = (newSkill: SkillType) => {
    setSkill(newSkill);
    const yr = activeStudent?.year || 4;
    const invs = getDskpInterventionsForYear(yr, newSkill);
    const stds = getLearningStandardsForYearAndSkill(yr, newSkill);
    if (invs.length > 0) {
      setInterventionTitle(`[DSKP Thn ${yr}] ${invs[0].title}`);
      setTargetTP(invs[0].targetTP);
      setTargetDescription(`${invs[0].description} • Aktiviti: ${invs[0].activities.join(', ')}`);
      setSelectedStandardCode(invs[0].learningStandardCode);
    } else if (stds.length > 0) {
      setSelectedStandardCode(stds[0].code);
      setInterventionTitle(`[DSKP ${stds[0].code}] Focused Support: ${stds[0].focus}`);
      setTargetDescription(`Differentiated support for standard ${stds[0].code}: ${stds[0].description}`);
    }
  };

  const handleApplyDskpPreset = (preset: typeof dskpInterventions[0]) => {
    setInterventionTitle(`[DSKP Thn ${pupilYear}] ${preset.title}`);
    setSelectedStandardCode(preset.learningStandardCode);
    setTargetTP(preset.targetTP);
    setTargetDescription(`${preset.description} • Aktiviti Disyorkan: ${preset.activities.join(', ')}`);
  };

  const handleCreateIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    addIntervention({
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      className: activeStudent.className,
      skill,
      currentTP: activeStudent[`${skill.toLowerCase()}TP` as keyof typeof activeStudent] as TPLevel,
      targetTP,
      interventionTitle: interventionTitle || `[DSKP Thn ${pupilYear}] Guided ${skill} Intervention`,
      targetDescription: targetDescription || `DSKP-aligned remedial task for Year ${pupilYear} (${skill})`,
      status: 'In Progress',
    });

    showToast('Intervensi Ditetapkan', `Pelan intervensi DSKP Tahun ${pupilYear} berjaya ditugaskan kepada ${activeStudent.name}.`, 'success');
    setShowAssignModal(false);
  };

  // Filtered interventions
  const filteredInterventions = interventions.filter((item) => {
    if (selectedYearFilter === 'all') return true;
    const student = students.find((s) => s.id === item.studentId || s.name === item.studentName);
    return student?.year === selectedYearFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              PBD INTERVENTION TRACKER
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              DSKP KSSR/KSSM Selaras
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Pelan intervensi berfokus dan bimbingan terbeza mengikut Standard Kurikulum dan Pentaksiran (Tahun 1 – 6).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-slate-200 text-xs font-bold px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">Semua Tahun (1-6)</option>
              <option value={1} className="bg-slate-900">Tahun 1 (Pre-A1)</option>
              <option value={2} className="bg-slate-900">Tahun 2 (A1 Low)</option>
              <option value={3} className="bg-slate-900">Tahun 3 (A1 Mid)</option>
              <option value={4} className="bg-slate-900">Tahun 4 (A2 Mid)</option>
              <option value={5} className="bg-slate-900">Tahun 5 (A2 Mid-High)</option>
              <option value={6} className="bg-slate-900">Tahun 6 (A2 High)</option>
            </select>
          </div>

          <button
            onClick={() => {
              if (activeStudent) {
                handleSelectStudent(activeStudent.id);
              }
              setShowAssignModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-red-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>TUGASKAN INTERVENSI DSKP</span>
          </button>
        </div>
      </div>

      {/* Interventions List Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-extrabold tracking-wider">
            <tr>
              <th className="p-4">Pupil & Year</th>
              <th className="p-4">Class</th>
              <th className="p-4">Skill Focus</th>
              <th className="p-4">Current → Target</th>
              <th className="p-4">Intervention Plan (DSKP Aligned)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Teacher Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredInterventions.map((item, idx) => {
              const isDone = item.status === 'Completed';
              const pupil = students.find((s) => s.id === item.studentId || s.name === item.studentName);
              const yr = pupil?.year || 4;

              return (
                <tr key={item.id ? `${item.id}-${idx}` : `int-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-extrabold text-white text-xs sm:text-sm">
                      {item.studentName}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                        Tahun {yr}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Assigned: {item.date}</span>
                    </div>
                  </td>

                  <td className="p-4 font-semibold text-slate-300">{item.className}</td>

                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {item.skill}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="font-bold text-red-300">{item.currentTP}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="font-bold text-emerald-300">{item.targetTP}</span>
                    </div>
                  </td>

                  <td className="p-4 max-w-xs">
                    <div className="font-bold text-slate-200 text-xs">{item.interventionTitle}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {item.targetDescription}
                    </p>
                  </td>

                  <td className="p-4">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>In Progress</span>
                      </span>
                    )}

                    {item.improved && (
                      <div className="mt-1 text-[10px] text-cyan-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>🎉 Improvement Detected!</span>
                      </div>
                    )}
                  </td>

                  {/* Teacher Action Button */}
                  <td className="p-4 text-right">
                    {!isDone ? (
                      <button
                        onClick={() => {
                          updateInterventionStatus(item.id, 'Completed', item.targetTP);
                          showToast('PBD Validated', `Intervensi diselesaikan! ${item.studentName} dinaik taraf kepada ${item.targetTP} selaras DSKP Tahun ${yr}.`, 'success');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap"
                        title="Mark complete and upgrade student official TP"
                      >
                        Sahkan {item.targetTP}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Disahkan</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ASSIGN INTERVENTION MODAL - DSKP INTEGRATED */}
      {showAssignModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">Tugaskan Intervensi DSKP KSSR / KSSM</h3>
                <p className="text-xs text-slate-400">
                  Modul sokongan pemulihan berfokus selaras DSKP Tahun {pupilYear} (CEFR: {dskpCurriculum.cefrLevel})
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                Tahun {pupilYear}
              </span>
            </div>

            <form onSubmit={handleCreateIntervention} className="space-y-4">
              {/* Select Pupil */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Murid</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className} • Tahun {s.year}) — Current {skill}: {s[`${skill.toLowerCase()}TP` as keyof typeof s] as string}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill & Target TP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kemahiran Bahasa (Modul DSKP)</label>
                  <select
                    value={skill}
                    onChange={(e) => handleSelectSkill(e.target.value as SkillType)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Speaking">Speaking (Lisan)</option>
                    <option value="Listening">Listening (Mendengar)</option>
                    <option value="Reading">Reading (Membaca)</option>
                    <option value="Writing">Writing (Menulis)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sasaran Tahap Penguasaan (Target TP)</label>
                  <select
                    value={targetTP}
                    onChange={(e) => setTargetTP(e.target.value as TPLevel)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="TP3">TP3 (Minimum Sasaran Kurikulum)</option>
                    <option value="TP4">TP4 (Baik & Menguasai)</option>
                    <option value="TP5">TP5 (Sangat Baik / Fasih)</option>
                    <option value="TP6">TP6 (Cemerlang / Role Model)</option>
                  </select>
                </div>
              </div>

              {/* DSKP Recommended Intervention Presets */}
              {dskpInterventions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Cadangan Intervensi DSKP Tahun {pupilYear} ({skill})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dskpInterventions.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyDskpPreset(preset)}
                        className="text-left px-3 py-2 rounded-lg bg-slate-900 border border-amber-500/40 hover:bg-amber-950/50 text-xs transition-colors cursor-pointer"
                      >
                        <div className="font-bold text-amber-200">
                          {preset.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Sasaran: {preset.targetTP} • Standard: {preset.learningStandardCode}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DSKP Learning Standard */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Standard Pembelajaran DSKP ({learningStandards.length} Standard Tahun {pupilYear})</span>
                </label>
                <select
                  value={selectedStandardCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedStandardCode(code);
                    const std = learningStandards.find((s) => s.code === code);
                    if (std) {
                      setInterventionTitle(`[DSKP ${std.code}] Remedial: ${std.focus}`);
                      setTargetDescription(`Differentiated support for ${std.code}: ${std.description}`);
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                >
                  {learningStandards.map((std) => (
                    <option key={std.code} value={std.code}>
                      [{std.code}] {std.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tajuk Intervensi
                </label>
                <input
                  type="text"
                  value={interventionTitle}
                  onChange={(e) => setInterventionTitle(e.target.value)}
                  required
                  placeholder="e.g. [DSKP 2.1.2] Guided Speaking Practice with Milo Buddy"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sasaran Pembelajaran & Aktiviti Intervensi
                </label>
                <textarea
                  rows={2}
                  value={targetDescription}
                  onChange={(e) => setTargetDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-red-500/20 cursor-pointer"
                >
                  Tugaskan Intervensi Kepada Murid
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

