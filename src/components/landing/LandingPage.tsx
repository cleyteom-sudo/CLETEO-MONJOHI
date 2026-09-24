import React from 'react';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Zap,
  CheckCircle2,
  XCircle,
  PlayCircle,
  ShieldCheck,
  BrainCircuit,
  Compass,
  Mic,
  Award,
  BookOpen,
  FileCheck,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { switchRole, setCurrentView } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Badge Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 animate-in fade-in slide-in-from-top-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold backdrop-blur-md shadow-lg shadow-blue-500/10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Malaysian Primary School English PBD Innovation</span>
            <span className="bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold">
              Year 4 — 6
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold backdrop-blur-md shadow-lg shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Cloud Synced Across All Devices & Phones</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-4">
          <span className="bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
            ENGLISH AI SMARTTRACK
          </span>
        </h1>

        {/* Tagline & Sub-tagline */}
        <div className="space-y-1 mb-6">
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-wide">
            “Assess. Analyse. Act.”
          </p>
          <p className="text-sm sm:text-base font-semibold text-slate-400 tracking-wide">
            RECORD LESS. ASSESS SMARTER. TEACH BETTER.
          </p>
        </div>

        {/* Description */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
          An intelligent digital platform that connects English PBD assessment, digital evidence,
          student learning portfolios, AI-assisted practice, early intervention, and progress
          tracking into one seamless, continuous learning cycle.
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={() => switchRole('teacher')}
            className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <GraduationCap className="w-5 h-5 text-cyan-300" />
            <span>ENTER TEACHER DASHBOARD</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => switchRole('student')}
            className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Zap className="w-5 h-5 text-emerald-200" />
            <span>ENTER STUDENT WORLD</span>
            <Compass className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentView('live-demo')}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-sm shadow-lg hover:border-amber-400 transition-all cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>LAUNCH 4-STEP LIVE DEMO</span>
          </button>
        </div>

        {/* Visual Workflow Steps */}
        <div className="max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">
            PBD CONTINUOUS LEARNING ARCHITECTURE
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 items-center">
            {[
              { label: 'TEACHER', desc: 'Sets Activity', color: 'from-blue-600 to-blue-700' },
              { label: 'PBD', desc: 'Target TP1-6', color: 'from-indigo-600 to-indigo-700' },
              { label: 'AI ANALYSIS', desc: 'Detects Weakness', color: 'from-cyan-600 to-blue-600' },
              { label: 'INTERVENE', desc: 'Targeted Practice', color: 'from-purple-600 to-pink-600' },
              { label: 'STUDENT', desc: 'Guided Practice', color: 'from-emerald-600 to-teal-600' },
              { label: 'PRACTICE', desc: 'Voice & Writing', color: 'from-amber-600 to-orange-600' },
              { label: 'PROGRESS', desc: 'Validated TP', color: 'from-blue-500 to-indigo-500' },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-full py-2.5 px-2 rounded-xl bg-gradient-to-br ${step.color} text-white font-extrabold text-[11px] tracking-wide shadow-md text-center`}
                >
                  {step.label}
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 text-center">
                  {step.desc}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-cyan-300">AI ASSISTS</span>
            <span>→</span>
            <span className="font-semibold text-indigo-300">TEACHER VALIDATES</span>
            <span>→</span>
            <span className="font-semibold text-emerald-300">PBD RECORD</span>
          </div>
        </div>
      </section>

      {/* WHY SMARTTRACK Section: Comparison Table */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            WHY SMARTTRACK?
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Traditional PBD recording is often a retrospective administrative chore.
            SmartTrack turns it into an active, actionable classroom partner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* OLD METHOD CARD */}
          <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/40 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-red-900/30">
              <XCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="font-black text-lg text-red-200">OLD METHOD</h3>
                <p className="text-xs text-red-400">Administrative burden & fragmented records</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="text-red-400 font-bold">📄</span>
                <span>Paper-based recording and scattered notes</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-red-400 font-bold">📊</span>
                <span>Scattered spreadsheets without historical insight</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-red-400 font-bold">⏰</span>
                <span>Time-consuming manual assessment entries</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-red-400 font-bold">📁</span>
                <span>Difficult physical evidence management</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-red-400 font-bold">🔎</span>
                <span>Limited progress visibility for pupils and parents</span>
              </li>
            </ul>
          </div>

          {/* SMARTTRACK CARD */}
          <div className="p-6 rounded-2xl bg-blue-950/30 border border-blue-500/40 backdrop-blur-md shadow-xl shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-blue-800/40">
              <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="font-black text-lg text-cyan-200">SMARTTRACK INNOVATION</h3>
                <p className="text-xs text-cyan-400">Continuous Assessment & Learning Cycle</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="flex items-center gap-2.5">
                <span className="text-cyan-400 font-bold">⚡</span>
                <span>Quick 1-Click PBD recording with batch presets</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-cyan-400 font-bold">🤖</span>
                <span>AI-assisted analysis identifying weak skills automatically</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-cyan-400 font-bold">🎙️</span>
                <span>Speech-assisted practice (AI Reading Helper & Milo Buddy)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-cyan-400 font-bold">📁</span>
                <span>Digital portfolio with drawing canvas & audio uploads</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-cyan-400 font-bold">🚨</span>
                <span>Early warning intervention alerts & instant reporting</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* WOW FACTOR: ONE STUDENT LEARNING JOURNEY */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>THE INNOVATION IN ACTION</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
              ONE STUDENT → COMPLETE LEARNING JOURNEY
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-8">
              Take Daniel Lee (Year 4 Bestari): from identified Speaking TP2 to validated TP4 progress.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { step: '1. PBD', desc: 'Speaking assessed at TP2/3', icon: '📋' },
                { step: '2. EVIDENCE', desc: 'Audio recording captured', icon: '🎙️' },
                { step: '3. AI INSIGHT', desc: 'Flags question confidence', icon: '🤖' },
                { step: '4. INTERVENE', desc: 'Assigned Milo Speaking', icon: '🎯' },
                { step: '5. PRACTICE', desc: '5-turn conversation completed', icon: '💬' },
                { step: '6. PROGRESS', desc: '+30 XP, Brave Speaker badge', icon: '⭐' },
                { step: '7. VALIDATE', desc: 'Teacher upgrades to TP4', icon: '✅' },
                { step: '8. PORTFOLIO', desc: 'QR record saved for parents', icon: '📱' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-center transition-transform hover:-translate-y-1"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-[11px] font-bold text-slate-200">{item.step}</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => switchRole('teacher')}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
              >
                Inspect Daniel Lee in Teacher Dashboard
              </button>
              <button
                onClick={() => switchRole('student')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
              >
                Experience Daniel Lee Student Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer disclaimer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-300">
            ENGLISH AI SMARTTRACK — “Record Less. Assess Smarter. Teach Better.”
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Demo Prototype — All student records and names shown are fictional for educational demonstration.
          </p>
        </div>
      </footer>
    </div>
  );
};
