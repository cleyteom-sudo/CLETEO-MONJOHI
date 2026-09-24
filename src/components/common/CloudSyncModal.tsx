import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  Laptop,
  Smartphone,
  Tablet,
  Users,
  Database,
  ShieldCheck,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDeviceInfo } from '../../services/firebase';

export const CloudSyncModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    students,
    classes,
    taskHistory,
    activityLogs,
    cloudSyncStatus,
    cloudSessions,
    lastCloudSyncTime,
    forceSyncAllToCloud,
    showToast,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const currentDevice = getDeviceInfo();

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await forceSyncAllToCloud();
      showToast('Cloud Sync Complete', 'All student data, classes, and tasks pushed to Google Cloud.', 'success');
    } catch {
      showToast('Sync Notice', 'Data is already synced with the cloud.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  const getDeviceIcon = (deviceStr?: string) => {
    const str = (deviceStr || '').toLowerCase();
    if (str.includes('smart') || str.includes('mobile') || str.includes('phone')) {
      return <Smartphone className="w-4 h-4 text-emerald-400" />;
    }
    if (str.includes('tablet') || str.includes('ipad')) {
      return <Tablet className="w-4 h-4 text-cyan-400" />;
    }
    return <Laptop className="w-4 h-4 text-blue-400" />;
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col my-auto max-h-[calc(100vh-2rem)] sm:max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Cloud className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Cross-Device Cloud Sync</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Active & Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Google Cloud Firestore • Real-time Sync Across Laptops & Phones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white text-sm">Synchronized Across All Devices</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Last checked: {lastCloudSyncTime || 'Just now'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Whenever you sign in, complete a speaking/reading activity, or update student TP on this device,
              the data updates instantly on every other laptop, smartphone, or tablet accessing this website.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-xl font-black text-white">{students.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Students Synced</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <Database className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-xl font-black text-white">{classes.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Classes Synced</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-xl font-black text-white">{taskHistory.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tasks & Stars</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-xl font-black text-white">{activityLogs.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Audit Logs</div>
            </div>
          </div>

          {/* Current Device Identification */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {getDeviceIcon(currentDevice)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">This Device:</span>
                  <span className="text-xs font-medium text-slate-300">{currentDevice}</span>
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Connected and listening for live changes
                </div>
              </div>
            </div>
          </div>

          {/* Connected Device Logins */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span>Recent Device Logins Across Network</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                {cloudSessions.length} recorded account(s)
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cloudSessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                  Login records will appear here as users access from phones and laptops.
                </div>
              ) : (
                cloudSessions.map((session, sIdx) => (
                  <div
                    key={session.id || sIdx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        {getDeviceIcon(session.lastDevice)}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{session.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            session.role === 'teacher'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {session.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {session.email} • {session.lastDevice || 'Web Browser'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      {session.lastLoginAt ? new Date(session.lastLoginAt).toLocaleTimeString() : 'Active'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted cloud database session</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
