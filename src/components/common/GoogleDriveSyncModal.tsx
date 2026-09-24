import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  FolderGit2,
  X,
  FileText,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  signInWithGoogleDrive,
  uploadJsonToGoogleDrive,
  isDriveConnected,
  getDriveAccessToken,
  DriveSyncResult,
} from '../../services/googleDriveService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveSyncModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    students,
    classes,
    evidenceList,
    interventions,
    activityLogs,
    currentStudent,
    role,
    showToast,
  } = useApp();

  const [connectedUserEmail, setConnectedUserEmail] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<DriveSyncResult | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await signInWithGoogleDrive();
      if (res?.user) {
        setConnectedUserEmail(res.user.email || 'Google User');
        showToast('Google Drive Connected', `Signed in as ${res.user.email}`, 'success');
      }
    } catch (err: any) {
      console.warn('Google Drive sign-in error:', err);
      showToast('Sign-In Note', err.message || 'Could not complete Google Sign-In popup.', 'warning');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSyncToDrive = async () => {
    setIsSyncing(true);
    try {
      const token = await getDriveAccessToken();
      if (!token && !connectedUserEmail) {
        // Prompt sign in first
        await handleSignIn();
      }

      const activeToken = await getDriveAccessToken();
      if (!activeToken) {
        // Fallback: offer direct download if OAuth token unavailable in current frame
        handleLocalExport();
        showToast('Cloud Backup Saved Locally', 'Exported PBD JSON backup file to your device.', 'info');
        setIsSyncing(false);
        return;
      }

      const payload = {
        app: 'English AI SmartTrack',
        version: '2.0-pbd',
        exportedAt: new Date().toISOString(),
        role,
        studentData: {
          profile: currentStudent,
          allStudentsCount: students.length,
          classesCount: classes.length,
        },
        classes,
        students,
        evidence: evidenceList,
        interventions,
        activityLogs,
      };

      const fileName =
        role === 'teacher'
          ? `English_AI_SmartTrack_Teacher_PBD_Backup_${new Date().toISOString().slice(0, 10)}.json`
          : `English_AI_SmartTrack_Student_${currentStudent?.name?.replace(/\s+/g, '_') || 'Portfolio'}.json`;

      const result = await uploadJsonToGoogleDrive(fileName, payload, activeToken);
      setLastSyncResult(result);

      if (result.success) {
        showToast('Google Drive Synced!', `Data successfully backed up to ${result.fileName}`, 'success');
      } else {
        showToast('Drive Sync Notice', result.error || 'Failed to sync to Drive.', 'warning');
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      showToast('Sync Error', err.message || 'Error occurred while syncing with Google Drive.', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLocalExport = () => {
    const payload = {
      app: 'English AI SmartTrack',
      exportedAt: new Date().toISOString(),
      student: currentStudent,
      classes,
      evidence: evidenceList,
      activityLogs,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `SmartTrack_PBD_Backup_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const isConnected = isDriveConnected() || !!connectedUserEmail;

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-200 shadow-2xl relative my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Google Drive Cloud Storage</h3>
            <p className="text-xs text-slate-400">
              Persist student activity data & teacher PBD records to Google Drive
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Connection Status:</span>
            <span
              className={`font-bold flex items-center gap-1.5 ${
                isConnected ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" /> Not Connected
                </>
              )}
            </span>
          </div>

          {connectedUserEmail && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Google Account:</span>
              <span className="font-mono text-cyan-300 font-bold">{connectedUserEmail}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Drive Scope:</span>
            <span className="font-mono text-[11px] text-slate-300">drive.file (App Folder)</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          {!isConnected ? (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 shadow-lg transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google to Connect Drive'}</span>
            </button>
          ) : (
            <button
              onClick={handleSyncToDrive}
              disabled={isSyncing}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing to Google Drive...' : 'Sync & Save All PBD Data to Google Drive'}</span>
            </button>
          )}

          <button
            onClick={handleLocalExport}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Local JSON Backup</span>
          </button>
        </div>

        {/* Sync Success Card */}
        {lastSyncResult?.success && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4" /> Google Drive Synced Successfully!
              </span>
              <span className="text-[10px] text-emerald-400">{lastSyncResult.timestamp}</span>
            </div>
            <p className="text-[11px] text-emerald-300/80 mb-2">
              File: <span className="font-mono">{lastSyncResult.fileName}</span>
            </p>
            {lastSyncResult.webViewLink && (
              <a
                href={lastSyncResult.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:underline"
              >
                <span>Open in Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
