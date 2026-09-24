import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  ArrowUpDown,
  Filter,
  Users,
  Clock,
  Sparkles,
  School,
  Shuffle,
  ShieldCheck,
  ChevronDown,
  X,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, ClassGroup } from '../../types';

export const NewStudentEnrollmentsSection: React.FC<{
  onClassCreated?: () => void;
}> = ({ onClassCreated }) => {
  const {
    students,
    classes,
    classEnrollmentAlerts,
    acceptStudentEnrollment,
    reassignStudentClass,
    createMissingClassAndEnroll,
    showToast,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'pending' | 'missing_class' | 'approved'>('pending');
  const [sortOption, setSortOption] = useState<'name_asc' | 'name_desc' | 'date_newest' | 'year_asc'>('name_asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Reassign modal state
  const [reassignModalData, setReassignModalData] = useState<{
    studentId: string;
    studentName: string;
    currentClass: string;
  } | null>(null);
  const [targetClassChoice, setTargetClassChoice] = useState<string>('');

  // Missing class direct create modal state
  const [createClassModalData, setCreateClassModalData] = useState<{
    studentId: string;
    studentName: string;
    className: string;
    year: number;
  } | null>(null);
  const [academicYearInput, setAcademicYearInput] = useState('2026/2027');

  // Filter students
  const pendingStudents = students.filter((s) => {
    const isPending = Boolean(s.pendingClassApproval);
    const hasAlert = classEnrollmentAlerts.some(
      (a) => (a.studentId === s.id || a.studentEmail === s.email) && a.status === 'pending'
    );
    return isPending || hasAlert;
  });

  const missingClassStudents = students.filter((s) => {
    const classExists = classes.some((c) => c.name.trim().toUpperCase() === s.className.trim().toUpperCase());
    return !classExists;
  });

  const displayedStudents = students.filter((s) => {
    const classExists = classes.some((c) => c.name.trim().toUpperCase() === s.className.trim().toUpperCase());
    const isPending = Boolean(s.pendingClassApproval);

    if (filterType === 'pending') {
      return isPending || !classExists;
    }
    if (filterType === 'missing_class') {
      return !classExists;
    }
    if (filterType === 'approved') {
      return !isPending && classExists;
    }
    return true; // 'all'
  }).filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.className.toLowerCase().includes(term) ||
      (s.email && s.email.toLowerCase().includes(term))
    );
  });

  // Sort students
  const sortedStudents = [...displayedStudents].sort((a, b) => {
    if (sortOption === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortOption === 'name_desc') {
      return b.name.localeCompare(a.name);
    }
    if (sortOption === 'year_asc') {
      return a.year - b.year;
    }
    if (sortOption === 'date_newest') {
      const timeA = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
      const timeB = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
      return timeB - timeA;
    }
    return 0;
  });

  const handleQuickAccept = (student: Student) => {
    acceptStudentEnrollment(student.id);
  };

  const handleOpenReassign = (student: Student) => {
    setReassignModalData({
      studentId: student.id,
      studentName: student.name,
      currentClass: student.className,
    });
    const defaultOther = classes.find((c) => c.name !== student.className) || classes[0];
    setTargetClassChoice(defaultOther?.name || '');
  };

  const handleConfirmReassign = () => {
    if (!reassignModalData || !targetClassChoice) return;
    const targetCls = classes.find((c) => c.name === targetClassChoice);
    reassignStudentClass(reassignModalData.studentId, targetClassChoice, targetCls?.year);
    setReassignModalData(null);
  };

  const handleOpenCreateMissing = (student: Student) => {
    setCreateClassModalData({
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      year: student.year || 4,
    });
  };

  const handleConfirmCreateMissing = () => {
    if (!createClassModalData) return;
    createMissingClassAndEnroll(
      createClassModalData.studentId,
      createClassModalData.className,
      createClassModalData.year,
      academicYearInput
    );
    setCreateClassModalData(null);
    if (onClassCreated) onClassCreated();
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl shadow-cyan-950/20 backdrop-blur-md space-y-6">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">New Student Enrollments & Class Approvals</h3>
              {pendingStudents.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 animate-pulse">
                  {pendingStudents.length} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review new student sign-ups, approve classroom entries, reassign wrong classes, or create missing classes.
            </p>
          </div>
        </div>

        {/* Action Highlights */}
        <div className="flex items-center gap-2">
          {missingClassStudents.length > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{missingClassStudents.length} Missing Class Alert</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar: Filters, Search, and Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'pending'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Needs Review ({pendingStudents.length})</span>
          </button>

          <button
            onClick={() => setFilterType('missing_class')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'missing_class'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Missing Classes ({missingClassStudents.length})</span>
          </button>

          <button
            onClick={() => setFilterType('approved')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === 'approved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Approved ({students.length - pendingStudents.length})
          </button>

          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Students ({students.length})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name / class..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-slate-300 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-[11px]">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              <option value="name_asc" className="bg-slate-900 text-white">Name (A → Z)</option>
              <option value="name_desc" className="bg-slate-900 text-white">Name (Z → A)</option>
              <option value="year_asc" className="bg-slate-900 text-white">Year (1 → 6)</option>
              <option value="date_newest" className="bg-slate-900 text-white">Date Enrolled (Newest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="space-y-3">
        {sortedStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
            <UserPlus className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="font-bold text-slate-400 text-sm">No students match this filter</p>
            <p className="text-xs text-slate-500 mt-0.5">
              New students will appear here as soon as they complete their DELIMa registration.
            </p>
          </div>
        ) : (
          sortedStudents.map((std) => {
            const classExists = classes.some(
              (c) => c.name.trim().toUpperCase() === std.className.trim().toUpperCase()
            );
            const isPending = Boolean(std.pendingClassApproval);

            return (
              <div
                key={std.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  !classExists
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-950/10'
                    : isPending
                    ? 'bg-cyan-950/20 border-cyan-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={std.avatarUrl || 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80'}
                    alt={std.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-white">{std.name}</h4>
                      <span className="text-xs font-bold text-slate-400">
                        • Year {std.year}
                      </span>
                      {/* Status Badges */}
                      {!classExists ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                          <span>Class Not Found</span>
                        </span>
                      ) : isPending ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Pending Teacher Acceptance
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Enrolled & Active</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="font-mono text-cyan-300">{std.email}</span>
                      <span>
                        Enrolled Class:{' '}
                        <strong className="text-white">{std.className}</strong>
                      </span>
                      {std.targetTeacher && (
                        <span className="text-indigo-300">
                          Teacher: <strong>{std.targetTeacher}</strong>
                        </span>
                      )}
                      {std.enrolledAt && (
                        <span className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {std.enrolledAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Per Condition */}
                <div className="flex items-center gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* CONDITION 1: Class does NOT exist -> Create Class & Enroll */}
                  {!classExists && (
                    <>
                      <button
                        onClick={() => handleOpenCreateMissing(std)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Create this missing class in the database and place student in it"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create "{std.className}" & Enroll</span>
                      </button>

                      <button
                        onClick={() => handleOpenReassign(std)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                        title="Reassign student to an existing class instead"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Reassign</span>
                      </button>
                    </>
                  )}

                  {/* CONDITION 2: Class exists, but student is pending teacher acceptance */}
                  {classExists && isPending && (
                    <>
                      <button
                        onClick={() => handleQuickAccept(std)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Enrollment</span>
                      </button>

                      <button
                        onClick={() => handleOpenReassign(std)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                        title="If student enrolled in wrong class, move to another class"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Wrong Class? Reassign</span>
                      </button>
                    </>
                  )}

                  {/* CONDITION 3: Already approved -> Teacher can still change class if needed */}
                  {classExists && !isPending && (
                    <button
                      onClick={() => handleOpenReassign(std)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                      title="Move student to another class"
                    >
                      <Shuffle className="w-3 h-3 text-cyan-400" />
                      <span>Change Class</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REASSIGN STUDENT CLASS MODAL */}
      {reassignModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Shuffle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Reassign Student Class</h4>
                  <p className="text-xs text-slate-400">Change class for {reassignModalData.studentName}</p>
                </div>
              </div>
              <button
                onClick={() => setReassignModalData(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Current enrolled class: <strong className="text-white">{reassignModalData.currentClass}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Select New Class for Pupil:
              </label>
              <select
                value={targetClassChoice}
                onChange={(e) => setTargetClassChoice(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold outline-none focus:border-cyan-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} (Year {c.year} • {c.academicYear})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Student's portfolio, task completions, and TP history will be preserved and linked to the new class.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setReassignModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReassign}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-lg shadow-cyan-600/20"
              >
                Confirm Move to {targetClassChoice}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MISSING CLASS MODAL */}
      {createClassModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Create Missing Class</h4>
                  <p className="text-xs text-slate-400">Class requested by {createClassModalData.studentName}</p>
                </div>
              </div>
              <button
                onClick={() => setCreateClassModalData(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200">
              This class was filled during student sign-up but does not exist in the system yet. Creating it will add it to the teacher dashboard and enroll the pupil.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Class Name:</label>
                <input
                  type="text"
                  value={createClassModalData.className}
                  onChange={(e) =>
                    setCreateClassModalData({ ...createClassModalData, className: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Year Level:</label>
                  <select
                    value={createClassModalData.year}
                    onChange={(e) =>
                      setCreateClassModalData({ ...createClassModalData, year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Academic Year:</label>
                  <input
                    type="text"
                    value={academicYearInput}
                    onChange={(e) => setAcademicYearInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setCreateClassModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreateMissing}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg"
              >
                Create Class & Approve Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
