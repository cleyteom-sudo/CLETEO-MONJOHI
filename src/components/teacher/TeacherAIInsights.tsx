import React from 'react';
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Mic,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TeacherAIInsights: React.FC = () => {
  const { classes, selectedClassId, students, addIntervention, setCurrentView, showToast } =
    useApp();

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.className === currentClass.name);

  const handleAddInterventionToPlan = () => {
    // Add speaking intervention for Daniel Lee or first pupil
    const targetPupil = classStudents.find((s) => s.name === 'Daniel Lee') || classStudents[0];
    if (!targetPupil) return;

    addIntervention({
      studentId: targetPupil.id,
      studentName: targetPupil.name,
      className: currentClass.name,
      skill: 'Speaking',
      currentTP: targetPupil.speakingTP,
      targetTP: 'TP4',
      interventionTitle: 'Speaking Buddy — My Favourite Food',
      targetDescription: 'Practice 5-turn structured dialogue with Milo 🤖 to build confidence in answering simple food questions.',
      status: 'In Progress',
      teacherNotes: 'AI suggested intervention accepted by teacher.',
    });

    setCurrentView('intervention');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-900/40 via-blue-900/30 to-slate-900 border border-cyan-800/40 shadow-xl backdrop-blur-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI PBD INSIGHT • SIMULATED ENGINE
            </span>
            <span className="text-xs text-slate-400">Class: {currentClass.name}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI PBD INSIGHT</h1>
          <p className="text-xs text-slate-300 mt-1">
            Automated pedagogical pattern detection for {currentClass.name} English mastery.
          </p>
        </div>

        <div className="hidden sm:block p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          <BrainCircuit className="w-8 h-8" />
        </div>
      </div>

      {/* Class Competency Distribution Gauges */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
          Competency Distribution — {currentClass.name}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { skill: 'Reading', pct: 78, status: 'On Track', color: 'bg-blue-500', tp: '4.0' },
            { skill: 'Writing', pct: 62, status: 'Developing', color: 'bg-purple-500', tp: '3.6' },
            { skill: 'Listening', pct: 81, status: 'Strong', color: 'bg-emerald-500', tp: '4.2' },
            { skill: 'Speaking', pct: 54, status: 'Action Needed', color: 'bg-red-500', tp: '3.4', alert: true },
          ].map((item) => (
            <div key={item.skill} className={`p-4 rounded-xl border ${item.alert ? 'bg-red-950/20 border-red-900/40' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-300">{item.skill}</span>
                <span className="font-mono text-cyan-300 font-bold">TP {item.tp}</span>
              </div>
              <div className="text-2xl font-black text-white mb-2">{item.pct}%</div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
              </div>
              <span className={`text-[10px] font-bold ${item.alert ? 'text-red-400' : 'text-slate-400'}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Generated Findings (Prompt Requirements #32) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            AI Analytical Diagnostic Findings
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            AI SUGGESTION — FOR TEACHER REVIEW
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-red-950/25 border border-red-900/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-200">
                Speaking currently requires additional learning support
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Speaking mastery (54%) is significantly lower than receptive listening skills (81%).
                Pupils understand questions when heard, but show hesitation when generating spoken answers independently.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-950/25 border border-blue-900/40 flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-blue-200">
                8 pupils are within the current intervention group
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Identified pupils include Daniel Lee (TP3), Adam Firdaus (TP2), Kumar Raj (TP3) and others who require scaffolded oral prompts to achieve CEFR A1 target standards.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-900/40 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-200">
                Recommended Pedagogical Strategy
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Consider short pair-speaking activities and guided digital dialogues before whole-class presentations. Utilizing the <strong>Milo 🤖 Speaking Buddy</strong> module provides low-anxiety speaking practice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDED INTERVENTION CARD (Prompt Requirement #32) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/40 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
            RECOMMENDED INTERVENTION
          </span>
          <span className="text-[10px] font-bold text-slate-400">Targeting TP2 & TP3 Pupils</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Activity</span>
            <div className="text-sm font-extrabold text-white mt-0.5">
              Speaking Buddy — My Favourite Food
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Duration</span>
            <div className="text-sm font-extrabold text-white mt-0.5">10 Minutes</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Grouping</span>
            <div className="text-sm font-extrabold text-white mt-0.5">Individual / Pairs</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Focus</span>
            <div className="text-sm font-extrabold text-cyan-300 mt-0.5">
              Simple sentences + confidence
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Clicking will enroll the intervention group and generate interactive activities for Daniel Lee.
          </span>
          <button
            onClick={handleAddInterventionToPlan}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ADD TO INTERVENTION PLAN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
