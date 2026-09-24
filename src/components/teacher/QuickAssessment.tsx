import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Upload,
  Mic,
  FileText,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Save,
  BookOpen,
  Award,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SkillType, TPLevel } from '../../types';
import {
  getDskpForYear,
  getLearningStandardsForYearAndSkill,
  getDskpTpDescriptor,
  getDskpInterventionsForYear,
} from '../../data/dskpData';

export const QuickAssessment: React.FC = () => {
  const {
    students,
    classes,
    selectedClassId,
    setSelectedClassId,
    selectedStudent,
    setSelectedStudentId,
    updateStudentTP,
    addEvidence,
    addIntervention,
    showToast,
  } = useApp();

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.className === currentClass.name);

  // Active student in assessment
  const activeStudent = selectedStudent || classStudents[0];

  // Year level for DSKP alignment (1 - 6)
  const curriculumYear = currentClass?.year || activeStudent?.year || 4;
  const dskpCurriculum = getDskpForYear(curriculumYear);

  // Assessment form state
  const [selectedSkill, setSelectedSkill] = useState<SkillType>('Speaking');
  const [selectedStandardCode, setSelectedStandardCode] = useState<string>('');
  const [activityTitle, setActivityTitle] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTP, setSelectedTP] = useState<TPLevel>('TP4');
  const [teacherNote, setTeacherNote] = useState('');
  const [evidenceTab, setEvidenceTab] = useState<'note' | 'file' | 'audio'>('note');
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Learning standards and rubric for current Year and Skill
  const learningStandards = getLearningStandardsForYearAndSkill(curriculumYear, selectedSkill);
  const currentStandard = learningStandards.find((s) => s.code === selectedStandardCode) || learningStandards[0];
  const dskpTpDescriptor = getDskpTpDescriptor(curriculumYear, selectedSkill, selectedTP);
  const dskpInterventions = getDskpInterventionsForYear(curriculumYear, selectedSkill);

  // Sync default standard and activity title when skill or year changes
  useEffect(() => {
    if (learningStandards.length > 0) {
      const defaultStd = learningStandards[0];
      setSelectedStandardCode(defaultStd.code);
      setActivityTitle(`[DSKP ${defaultStd.code}] ${defaultStd.description.slice(0, 60)}...`);
      setTeacherNote(`Pupil demonstrated competence in DSKP ${defaultStd.code} (${selectedSkill}). Achieved ${selectedTP} performance standard.`);
    }
  }, [selectedSkill, curriculumYear]);

  // When standard code changes, update activity title
  const handleStandardChange = (code: string) => {
    setSelectedStandardCode(code);
    const std = learningStandards.find((s) => s.code === code);
    if (std) {
      setActivityTitle(`[DSKP ${std.code}] ${std.description.slice(0, 65)}`);
      setTeacherNote(`Assessment for DSKP ${std.code} (${std.focus}). Pupil attained ${selectedTP}.`);
    }
  };

  // Handle Recording simulation with browser MediaRecorder or fallback
  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setHasRecordedAudio(true);
        showToast('Audio Sample Captured', '0:35 audio recording attached to evidence', 'success');
      }, 3000);
    } else {
      setIsRecording(false);
      setHasRecordedAudio(true);
    }
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    // 1. Update official PBD TP
    updateStudentTP(activeStudent.id, selectedSkill, selectedTP, teacherNote, true);

    // 2. If evidence was attached, save evidence record
    if (evidenceTab === 'file' && uploadedFileName) {
      addEvidence({
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        skill: selectedSkill,
        activityTitle: activityTitle || `DSKP ${currentStandard?.code || ''} ${selectedSkill} Assessment`,
        evidenceType: 'file',
        textContent: `Attached file: ${uploadedFileName}. DSKP Standard: ${currentStandard?.code || 'N/A'}. Teacher note: ${teacherNote}`,
        teacherStatus: 'Teacher Validated',
        teacherFeedback: teacherNote,
        validatedTP: selectedTP,
      });
    } else if (evidenceTab === 'audio' && hasRecordedAudio) {
      addEvidence({
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        skill: selectedSkill,
        activityTitle: activityTitle || `DSKP ${currentStandard?.code || ''} Speaking Audio Record`,
        evidenceType: 'audio',
        audioDuration: '0:35',
        textContent: `Live classroom audio record for DSKP ${currentStandard?.code || ''}: ${teacherNote}`,
        teacherStatus: 'Teacher Validated',
        teacherFeedback: teacherNote,
        validatedTP: selectedTP,
      });
    } else if (teacherNote) {
      addEvidence({
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        skill: selectedSkill,
        activityTitle: activityTitle || `DSKP ${currentStandard?.code || ''} Classroom Observation`,
        evidenceType: 'writing',
        textContent: `DSKP Year ${curriculumYear} [${currentStandard?.code || ''}] Observation: ${teacherNote}`,
        teacherStatus: 'Teacher Validated',
        teacherFeedback: teacherNote,
        validatedTP: selectedTP,
      });
    }

    setHasRecordedAudio(false);
    setUploadedFileName('');
    showToast('PBD Assessment Recorded', `${activeStudent.name} saved at ${selectedTP} (${selectedSkill}) strictly aligned to DSKP Year ${curriculumYear}.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title Header with DSKP KSSR Semakan Badge */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-800/40 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  QUICK PBD ASSESSMENT
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  DSKP Tahun {curriculumYear}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dokumen Standard Kurikulum dan Pentaksiran (DSKP) Bahasa Inggeris • CEFR Target: {dskpCurriculum.cefrLevel}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-blue-500/30 text-right">
            <div className="text-[10px] uppercase font-bold text-blue-400">Rangka Kerja Rasmi</div>
            <div className="text-xs font-black text-white">{dskpCurriculum.curriculumFramework}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAssessment} className="space-y-6">
        {/* Step 1: Class, Student & Skill Selectors */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>1. Target Pupil & Session Parameters</span>
            <span className="text-[11px] text-blue-400 font-bold">Standard DSKP Tahun {curriculumYear} Terpilih</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Class select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Tahun {c.year} • DSKP KSSR)
                  </option>
                ))}
              </select>
            </div>

            {/* Student select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Pupil
              </label>
              <select
                value={activeStudent?.id || ''}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500"
              >
                {classStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Current {selectedSkill}: {s[`${selectedSkill.toLowerCase()}TP` as keyof typeof s] as string})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assessment Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={assessmentDate}
                  onChange={(e) => setAssessmentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Skill Selector Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Assessed English Skill (DSKP 4 Modul Kemahiran Bahasa)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['Reading', 'Writing', 'Listening', 'Speaking'] as SkillType[]).map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedSkill === skill
                      ? skill === 'Speaking'
                        ? 'bg-red-500/20 border-red-500 text-red-300 shadow-md shadow-red-500/10'
                        : 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{skill}</span>
                  {activeStudent && (
                    <span className="text-[10px] opacity-75 font-mono">
                      ({activeStudent[`${skill.toLowerCase()}TP` as keyof typeof activeStudent] as string})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* DSKP Learning Standard Selector for Year 1 - 6 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>DSKP Learning Standard (Standard Pembelajaran Tahun {curriculumYear})</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {learningStandards.length} Standard Tersedia
              </span>
            </div>

            <select
              value={selectedStandardCode}
              onChange={(e) => handleStandardChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-blue-500/40 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-blue-400"
            >
              {learningStandards.map((std) => (
                <option key={std.code} value={std.code}>
                  [{std.code}] {std.description}
                </option>
              ))}
            </select>

            {currentStandard && (
              <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 flex flex-col gap-1">
                <div>
                  <strong className="text-slate-200">Content Standard ({currentStandard.contentStandardCode}):</strong>{' '}
                  {currentStandard.contentStandardDesc}
                </div>
                <div>
                  <strong className="text-cyan-300">Focus & Skill Competency:</strong> {currentStandard.focus}
                </div>
              </div>
            )}
          </div>

          {/* Activity Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Classroom Activity / Task Name
            </label>
            <input
              type="text"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              placeholder="e.g. Unit 4 Speaking Dialogue, Reading Comprehension Passage 2"
              required
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Step 2: TP Level Selection (TP1 - TP6) Strictly from DSKP */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Assign Official PBD Tahap Penguasaan (TP 1 – TP 6)
              </h3>
              <p className="text-[11px] text-slate-500">
                Berdasarkan Standard Prestasi DSKP Tahun {curriculumYear} ({selectedSkill})
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Teacher Validated
            </span>
          </div>

          {/* TP Selector Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {(['TP1', 'TP2', 'TP3', 'TP4', 'TP5', 'TP6'] as TPLevel[]).map((tp) => {
              const isSelected = selectedTP === tp;
              const isLow = tp === 'TP1' || tp === 'TP2';
              const isHigh = tp === 'TP5' || tp === 'TP6';

              return (
                <button
                  type="button"
                  key={tp}
                  onClick={() => setSelectedTP(tp)}
                  className={`py-3 px-2 rounded-xl font-black text-sm transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? isLow
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/25 scale-105'
                        : isHigh
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                        : 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{tp}</span>
                  <span className="text-[10px] font-normal opacity-80">
                    {tp === 'TP1' ? 'Tahap 1' : tp === 'TP2' ? 'Tahap 2' : tp === 'TP3' ? 'Tahap 3' : tp === 'TP4' ? 'Tahap 4' : tp === 'TP5' ? 'Tahap 5' : 'Tahap 6'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* DSKP Official Rubric Descriptor for chosen TP */}
          <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 text-xs text-slate-300 leading-relaxed space-y-1">
            <div className="flex items-center justify-between text-blue-400 font-bold text-[11px]">
              <span>DESKRIPSI STANDARD PRESTASI DSKP TAHUN {curriculumYear} ({selectedTP})</span>
              <span className="text-[10px] text-slate-400">CEFR: {dskpCurriculum.cefrLevel}</span>
            </div>
            <p className="font-semibold text-white">
              {dskpTpDescriptor}
            </p>
          </div>

          {/* If TP1 or TP2 is chosen, show DSKP Intervene prompt */}
          {(selectedTP === 'TP1' || selectedTP === 'TP2') && dskpInterventions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Pelan Intervensi DSKP Diperlukan untuk {activeStudent?.name} ({selectedTP})</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Berdasarkan DSKP Tahun {curriculumYear}, murid yang berada di bawah TP3 memerlukan modul sokongan intervensi berfokus.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {dskpInterventions.map((inv, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (!activeStudent) return;
                      addIntervention({
                        studentId: activeStudent.id,
                        studentName: activeStudent.name,
                        className: activeStudent.className,
                        skill: selectedSkill,
                        currentTP: selectedTP,
                        targetTP: inv.targetTP,
                        interventionTitle: `[DSKP Thn ${curriculumYear}] ${inv.title}`,
                        targetDescription: `${inv.description} • Aktiviti: ${inv.activities.join(', ')}`,
                        status: 'In Progress',
                      });
                      showToast('Intervensi DSKP Ditetapkan', `${inv.title} telah ditambah ke Tracker Intervensi untuk ${activeStudent.name}.`, 'success');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Tetapkan: {inv.title} (Sasaran {inv.targetTP})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Teacher Note & Evidence Attachment */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            3. Teacher Professional Note & Evidence Attachment
          </h3>

          {/* Teacher Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Teacher Observation & Qualitative Feedback
            </label>
            <textarea
              rows={3}
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="Record specific teacher notes, strengths observed, or areas requiring guided intervention..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Evidence Type Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Evidence Supporting Assessment
            </label>
            <div className="flex rounded-xl bg-slate-950 p-1 mb-3 border border-slate-800 w-fit">
              <button
                type="button"
                onClick={() => setEvidenceTab('note')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  evidenceTab === 'note' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ADD NOTE</span>
              </button>
              <button
                type="button"
                onClick={() => setEvidenceTab('file')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  evidenceTab === 'file' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>UPLOAD FILE</span>
              </button>
              <button
                type="button"
                onClick={() => setEvidenceTab('audio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  evidenceTab === 'audio' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>RECORD AUDIO</span>
              </button>
            </div>

            {evidenceTab === 'file' && (
              <label className="block p-4 border border-dashed border-slate-700 rounded-xl bg-slate-950/60 text-center cursor-pointer hover:border-blue-500">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-300 font-semibold">
                  {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Select Worksheet Photo, PDF or Student Script'}
                </span>
                <input
                  type="file"
                  onChange={(e) => setUploadedFileName(e.target.files?.[0]?.name || '')}
                  className="hidden"
                />
              </label>
            )}

            {evidenceTab === 'audio' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Live Classroom Audio Capture</div>
                  <div className="text-[11px] text-slate-400">
                    {hasRecordedAudio
                      ? '✓ 0:35 Audio recording captured and ready to attach'
                      : isRecording
                      ? '🎙️ Listening to pupil voice... (Speaking now)'
                      : 'Record pupil reading aloud or answering questions directly'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : hasRecordedAudio
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRecording ? 'STOP' : hasRecordedAudio ? 'RE-RECORD' : 'RECORD VOICE'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <Save className="w-5 h-5" />
            <span>SIMPAN PENILAIAN PBD (DSKP TAHUN {curriculumYear})</span>
          </button>
        </div>
      </form>
    </div>
  );
};

