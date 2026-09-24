import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Lock,
  Mail,
  GraduationCap,
  UserCheck,
  Building2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  School,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { loginDemo, showToast } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student'>('teacher');
  const [email, setEmail] = useState('teacher.demo@moe.gov.my');
  const [password, setPassword] = useState('Demo123!');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('SK Seri Bintang Bestari');
  const [yearClass, setYearClass] = useState('Year 4 — 4 BESTARI');

  if (!isOpen) return null;

  const handleRoleChange = (role: 'teacher' | 'student') => {
    setSelectedRole(role);
    if (role === 'teacher') {
      setEmail('teacher.demo@moe.gov.my');
      setPassword('Demo123!');
    } else {
      setEmail('student.demo@moe.gov.my');
      setPassword('Demo123!');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginDemo(selectedRole);
    onClose();
  };

  const handleDelimaLogin = () => {
    loginDemo(selectedRole);
    showToast('DELIMa / MOE SSO Authentication', `Authenticated demo session via MOE identity provider as ${selectedRole}`, 'success');
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginDemo(selectedRole);
    showToast('Account Created (Prototype)', `Welcome, ${fullName || 'New Educator'}! Signed into ${selectedRole} portal.`, 'success');
    onClose();
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[2px] mb-3 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Welcome to English AI SmartTrack
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Pentaksiran Bilik Darjah (PBD) Management & AI Learning System
          </p>
        </div>

        {/* Tabs: Login vs Register */}
        <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Role toggle buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('teacher')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
              selectedRole === 'teacher'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>TEACHER LOGIN</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
              selectedRole === 'student'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>STUDENT LOGIN</span>
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* 1-click Demo credentials callout */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold uppercase text-[10px] text-cyan-400 tracking-wider">
                  DEMO ACCOUNT — FICTIONAL
                </span>
                <span className="text-[10px] text-blue-300 bg-blue-900/60 px-1.5 py-0.5 rounded">
                  1-Click Auto Fill
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Email:{' '}
                <span className="font-mono text-cyan-300 font-semibold">
                  {selectedRole === 'teacher' ? 'teacher.demo@moe.gov.my' : 'student.demo@moe.gov.my'}
                </span>
                <br />
                Password:{' '}
                <span className="font-mono text-cyan-300 font-semibold">Demo123!</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official MOE Email (@moe.gov.my / @moe-dl.edu.my)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>SIGN IN TO SMARTTRACK</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-slate-900 px-2 text-slate-400 font-bold">Or Institutional SSO</span>
              </div>
            </div>

            {/* DELIMa / MOE Login Button */}
            <button
              type="button"
              onClick={handleDelimaLogin}
              className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800/80 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-inner"
            >
              <School className="w-4 h-4 text-amber-400" />
              <span>LOGIN WITH DELIMa / MOE</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Cikgu Sarah / Daniel Lee"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                defaultValue={selectedRole === 'teacher' ? 'sarah.ahmad@moe.gov.my' : 'daniel@moe-dl.edu.my'}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">School</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Year / Class</label>
                <input
                  type="text"
                  value={yearClass}
                  onChange={(e) => setYearClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  defaultValue="Demo123!"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  defaultValue="Demo123!"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <span>CREATE {selectedRole.toUpperCase()} ACCOUNT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Security & MOE disclaimer footnote */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-start gap-2 text-[10px] text-slate-400 leading-snug">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Educational Privacy Notice:</strong> All student accounts shown are simulated demo profiles.
            In institutional deployment, authentication integrates with Malaysia MOE Single Sign-On (DELIMa).
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
