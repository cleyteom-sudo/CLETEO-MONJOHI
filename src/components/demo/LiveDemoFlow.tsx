import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  BrainCircuit,
  Zap,
  ShieldCheck,
  RotateCcw,
  Play,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LiveDemoFlow: React.FC = () => {
  const {
    switchRole,
    setCurrentView,
    updateStudentTP,
    addEvidence,
    addIntervention,
    triggerCelebration,
    showToast,
    students,
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1: Teacher Records PBD (Daniel Lee Speaking TP3)
  const handleExecuteStep1 = () => {
    updateStudentTP('std-3', 'Speaking', 'TP3', 'Demonstrated understanding but needs guided confidence.', true);
    setCompletedSteps((prev) => [...prev, 1]);
    setCurrentStep(2);
    showToast('Step 1 Complete', 'Daniel Lee speaking assessed at TP3 with baseline note.', 'success');
  };

  // Step 2: AI Diagnoses & Recommends Milo Speaking Buddy
  const handleExecuteStep2 = () => {
    addIntervention({
      studentId: 'std-3',
      studentName: 'Daniel Lee',
      className: '4 BESTARI',
      skill: 'Speaking',
      currentTP: 'TP3',
      targetTP: 'TP4',
      interventionTitle: 'Speaking Buddy — My Favourite Food',
      targetDescription: 'Practice 5-turn structured dialogue with Milo 🤖 to build confidence in answering simple food questions.',
      status: 'In Progress',
    });
    setCompletedSteps((prev) => [...prev, 2]);
    setCurrentStep(3);
    showToast('Step 2 Complete', 'AI insight generated and Milo speaking intervention enrolled.', 'success');
  };

  // Step 3: Student Practices with Milo (+20 XP, audio evidence submitted)
  const handleExecuteStep3 = () => {
    switchRole('student');
    addEvidence({
      studentId: 'std-3',
      studentName: 'Daniel Lee',
      skill: 'Speaking',
      activityTitle: 'Speaking Buddy Practice — My Favourite Food',
      evidenceType: 'audio',
      audioDuration: '1:45',
      textContent: 'Completed 5-turn spoken conversation with Milo on "My Favourite Food". High confidence!',
      teacherStatus: 'Pending Review',
      aiSuggestedTP: 'TP4',
    });
    triggerCelebration();
    setCompletedSteps((prev) => [...prev, 3]);
    setCurrentStep(4);
    showToast('Step 3 Complete', 'Daniel completed 5 dialogue turns with Milo! +20 XP awarded.', 'success');
  };

  // Step 4: Teacher Validates Progress (TP3 -> TP4 upgrade & celebration)
  const handleExecuteStep4 = () => {
    switchRole('teacher');
    updateStudentTP('std-3', 'Speaking', 'TP4', 'Teacher validated speaking mastery after Milo conversation.', true);
    triggerCelebration();
    setCompletedSteps((prev) => [...prev, 4]);
    showToast('Step 4 Complete 🎉', 'Daniel Lee Speaking upgraded from TP3 → TP4! PBD validated.', 'success');
  };

  const handleResetDemo = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    switchRole('teacher');
  };

  const steps = [
    {
      num: 1,
      title: 'TEACHER RECORDS PBD',
      subtitle: 'Identify baseline performance',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-600',
      description: 'Open quick assessment for Daniel Lee (Year 4 Bestari). Assess Speaking at TP3 with qualitative note: "Needs confidence in answering simple questions."',
      actionLabel: '1-Click: Record Daniel Speaking TP3',
      handler: handleExecuteStep1,
    },
    {
      num: 2,
      title: 'AI DIAGNOSES & RECOMMENDS',
      subtitle: 'Algorithmic pattern detection',
      icon: BrainCircuit,
      color: 'from-cyan-600 to-blue-600',
      description: 'System detects speaking support alert across 4 Bestari. AI suggests "Speaking Buddy — My Favourite Food" (10 mins, pairs/individual). Teacher confirms and adds to intervention plan.',
      actionLabel: '1-Click: Accept AI Intervention Plan',
      handler: handleExecuteStep2,
    },
    {
      num: 3,
      title: 'STUDENT PRACTICES WITH MILO',
      subtitle: 'Low-anxiety gamified speaking',
      icon: Zap,
      color: 'from-amber-600 to-red-600',
      description: 'Switch to Daniel Lee portal. Daniel talks with Milo 🤖 about his favourite food (nasi lemak), completes 5 dialogue turns, earns +20 XP and submits audio evidence.',
      actionLabel: '1-Click: Simulate Student Practice',
      handler: handleExecuteStep3,
    },
    {
      num: 4,
      title: 'TEACHER VALIDATES PROGRESS',
      subtitle: 'Professional judgement & milestone upgrade',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-600',
      description: 'Teacher reviews submitted voice evidence in repository. Upgrades Daniel Speaking TP3 → TP4! Class analytics, student portfolio, and idMe exports update automatically.',
      actionLabel: '1-Click: Validate TP3 → TP4 Improvement',
      handler: handleExecuteStep4,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-blue-950 border border-amber-500/30 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Interactive Live Demonstration
            </span>
            <span className="text-xs text-slate-400">4-Step Guided Evaluation Journey</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            English AI SmartTrack Live Demo Tour
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Experience the complete closed-loop PBD journey for Daniel Lee in 4 interactive steps.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* 4 Steps Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = completedSteps.includes(step.num);
          const isCurrent = currentStep === step.num;

          return (
            <div
              key={step.num}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-slate-900/60 border-emerald-500/40 shadow-lg'
                  : isCurrent
                  ? 'bg-slate-900/90 border-blue-500 shadow-2xl shadow-blue-500/15 scale-[1.01]'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        STEP {step.num}
                      </span>
                      <h3 className="text-base font-black text-white">{step.title}</h3>
                    </div>
                  </div>

                  {isDone ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Done
                    </span>
                  ) : isCurrent ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/30 animate-pulse">
                      Active Step
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed my-3">{step.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <button
                  onClick={step.handler}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isDone
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : isCurrent
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Re-run Step' : step.actionLabel}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Celebration Card */}
      {completedSteps.length === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950 border border-emerald-500/40 text-center shadow-2xl animate-in zoom-in-95">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-300 mb-2">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white">Full PBD Learning Cycle Completed! 🎉</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-1 mb-6">
            You have experienced how English AI SmartTrack turns PBD assessment from a paper burden into
            an intelligent, continuous engine of pupil growth.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                switchRole('teacher');
                setCurrentView('student-list');
              }}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              Inspect Daniel Lee in Teacher Roster
            </button>
            <button
              onClick={() => {
                switchRole('student');
                setCurrentView('student-portfolio');
              }}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 cursor-pointer"
            >
              Open Daniel's Student Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
